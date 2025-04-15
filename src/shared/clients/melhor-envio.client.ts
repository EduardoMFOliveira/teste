// src/shared/clients/melhor-envio.client.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

interface ShippingOption {
  type: string;
  price: number;
  deliveryTime: string;
}

@Injectable()
export class MelhorEnvioClient {
  private readonly logger = new Logger(MelhorEnvioClient.name);
  private accessToken: string;
  private readonly auth: {
    client_id: string;
    client_secret: string;
  };

  constructor(private configService: ConfigService) {
    this.auth = {
      client_id: this.configService.get('MELHOR_ENVIO_CLIENT_ID'),
      client_secret: this.configService.get('MELHOR_ENVIO_CLIENT_SECRET')
    };
  }

  async calculateShipping(from: string, to: string): Promise<ShippingOption[]> {
    if (!this.accessToken) await this.authenticate();

    try {
      const response = await axios.post(
        'https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate',
        {
          from: { postal_code: from },
          to: { postal_code: to },
          package: {
            weight: 1,
            width: 10,
            height: 10,
            length: 10
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            Accept: 'application/json'
          }
        }
      );

      return response.data.map(option => ({
        type: this.mapServiceType(option.name),
        price: option.price,
        deliveryTime: `${option.delivery_time} dias úteis`
      }));
    } catch (error) {
      this.logger.error(`Erro no cálculo de frete: ${error.response?.data || error.message}`);
      throw new Error('Erro ao calcular opções de frete');
    }
  }

  private async authenticate() {
    try {
      const response = await axios.post(
        'https://sandbox.melhorenvio.com.br/oauth/token',
        {
          grant_type: 'client_credentials',
          ...this.auth
        }
      );
      this.accessToken = response.data.access_token;
    } catch (error) {
      this.logger.error('Falha na autenticação no Melhor Envio');
      throw new Error('Erro de autenticação com Melhor Envio');
    }
  }

  private mapServiceType(name: string): string {
    const types = {
      'Sedex': 'Sedex',
      'PAC': 'PAC',
      'Melhor Envio': 'Econômico'
    };
    return types[name] || name;
  }
}