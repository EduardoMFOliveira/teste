// src/shared/clients/google-maps.client.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleMapsClient {
  private readonly logger = new Logger(GoogleMapsClient.name);
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
  }

  async getCoordinates(address: string) {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: address,
            key: this.apiKey
          }
        }
      );

      if (!response.data.results[0]) {
        throw new Error('Endereço não encontrado');
      }

      return response.data.results[0].geometry.location;
    } catch (error) {
      this.logger.error(`Google Maps Error: ${error.message}`);
      throw new Error('Erro ao obter coordenadas do Google Maps');
    }
  }

  async calculateDistance(origin: string, destination: string) {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/distancematrix/json`,
        {
          params: {
            origins: origin,
            destinations: destination,
            key: this.apiKey,
            units: 'metric'
          }
        }
      );

      return response.data.rows[0].elements[0].distance.value / 1000; // Retorna em km
    } catch (error) {
      this.logger.error(`Google Maps Distance Error: ${error.message}`);
      throw new Error('Erro ao calcular distância');
    }
  }
}