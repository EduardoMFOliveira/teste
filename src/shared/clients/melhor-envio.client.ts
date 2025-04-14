// src/shared/clients/melhor-envio.client.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MelhorEnvioClient {
  private readonly logger = new Logger(MelhorEnvioClient.name);
  private readonly auth: { client_id: string; client_secret: string };
  private accessToken: string;

  constructor(private configService: ConfigService) {
    this.auth = {
      client_id: this.configService.get<string>('MELHOR_ENVIO_CLIENT_ID'),
      client_secret: this.configService.get<string>('MELHOR_ENVIO_CLIENT_SECRET')
    };
  }

  private async authenticate() {
    try {
      const response = await axios.post(
        'https://sandbox.melhorenvio.com.br/oauth/token',
        {
          grant_type: 'client_credentials',
          client_id: this.auth.client_id,
          client_secret: this.auth.client_secret
        }
      );

      this.accessToken = response.data.access_token;
    } catch (error) {
      this.logger.error('Melhor Envio Auth Error', error.response?.data);
      throw new Error('Falha na autenticação com Melhor Envio');
    }
  }

  async calculateShipping(from: string, to: string) {
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
        codProdutoAgencia: option.id,
        price: option.price,
        prazo: option.delivery_time,
        description: option.name
      }));
    } catch (error) {
      this.logger.error('Melhor Envio Shipping Error', error.response?.data);
      throw new Error('Erro ao calcular frete');
    }
  }
}