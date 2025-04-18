// src/shared/clients/google-maps.client.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GoogleMapsClient {
  private readonly logger = new Logger(GoogleMapsClient.name);
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
  }

  async getCoordinates(address: string): Promise<{ lat: number; lng: number }> {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: address,
          key: this.apiKey
        }
      });

      if (!response.data.results[0]) {
        throw new Error('Endereço não encontrado');
      }

      return response.data.results[0].geometry.location;
    } catch (error) {
      this.logger.error(`Erro no Google Maps: ${error.message}`);
      throw new Error('Falha ao obter coordenadas');
    }
  }

  async calculateDistance(origin: string, destination: string): Promise<{distance: number, duration: number}> {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          origins: origin,
          destinations: destination,
          key: this.apiKey,
          units: 'metric'
        }
      });

      const element = response.data.rows[0].elements[0];
      return {
        distance: element.distance.value / 1000, // km
        duration: element.duration.value // segundos
      };
    } catch (error) {
      this.logger.error(`Erro no cálculo de distância: ${error.message}`);
      throw new Error('Falha ao calcular distância');
    }
  }
}