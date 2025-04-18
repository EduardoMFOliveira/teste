// src/shared/clients/melhor-envio.client.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class MelhorEnvioClient {
  private readonly logger = new Logger(MelhorEnvioClient.name);
  private readonly http: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.http = axios.create({
      baseURL: this.configService.get('MELHOR_ENVIO_BASE_URL') || 'https://melhorenvio.com.br/api/v2',
      headers: {
        'Authorization': `Bearer ${this.configService.get('MELHOR_ENVIO_ACCESS_TOKEN')}`,
        'User-Agent': this.configService.get('APP_NAME') + '/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
  }

  private getDefaultProducts() {
    return [{
      id: 'default',
      width: this.configService.get<number>('DEFAULT_PRODUCT_WIDTH'),
      height: this.configService.get<number>('DEFAULT_PRODUCT_HEIGHT'),
      length: this.configService.get<number>('DEFAULT_PRODUCT_LENGTH'),
      weight: this.configService.get<number>('DEFAULT_PRODUCT_WEIGHT'),
      quantity: 1
    }];
  }

  async calculateShipping(from: string, to: string): Promise<Array<{
    type: string;
    price: number;
    deliveryTime: string;
  }>> {
    try {
      const response = await this.http.post('/me/shipment/calculate', {
        from: { postal_code: from },
        to: { postal_code: to },
        products: this.getDefaultProducts(),
        options: {
          insurance_value: 0,
          receipt: false,
          own_hand: false
        }
      });

      return this.parseShippingOptions(response.data);
    } catch (error) {
      this.logger.error(`Erro no cálculo de frete: ${error.message}`, error.stack);
      return [{
        type: 'Indisponível',
        price: 0,
        deliveryTime: 'Consulte-nos'
      }];
    }
  }

  private parseShippingOptions(data: any[]): Array<{
    type: string;
    price: number;
    deliveryTime: string;
  }> {
    return data
      .filter(option => 
        option.name?.includes('PAC') || 
        option.name?.includes('Sedex')
      )
      .map(option => ({
        type: option.name.replace('Melhor Envio ', ''),
        price: Number(option.price),
        deliveryTime: `${option.delivery_time} dias úteis`
      }));
  }
}