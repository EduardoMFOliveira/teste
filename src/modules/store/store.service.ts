// src/modules/store/store.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { ViaCEPClient } from '../../shared/clients/viacep.client';
import { GoogleMapsClient } from '../../shared/clients/google-maps.client';
import { MelhorEnvioClient } from '../../shared/clients/melhor-envio.client';

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);
  private readonly PDV_RADIUS = 50;

  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    private viaCEP: ViaCEPClient,
    private googleMaps: GoogleMapsClient,
    private melhorEnvio: MelhorEnvioClient
  ) {}

  async findNearbyStores(cep: string) {
    try {
      const userAddress = await this.viaCEP.getAddress(cep);
      const userCoords = await this.googleMaps.getCoordinates(
        `${userAddress.street}, ${userAddress.city}`
      );

      const stores = await this.storeRepository.find();
      const results = await Promise.all(
        stores.map(async store => ({
          ...store,
          distance: await this.calculateDistance(store, userCoords)
        }))
      );

      return this.classifyStores(results, cep);
    } catch (error) {
      this.logger.error(`Erro na busca por CEP ${cep}: ${error.message}`);
      throw error;
    }
  }

  private async calculateDistance(store: Store, userCoords: any) {
    const origin = `${store.latitude},${store.longitude}`;
    const destination = `${userCoords.lat},${userCoords.lng}`;
    return this.googleMaps.calculateDistance(origin, destination);
  }

  private async classifyStores(stores: any[], cep: string) {
    return Promise.all(stores.map(async store => {
      const isPDV = store.distance <= this.PDV_RADIUS;
      
      return {
        ...store,
        type: isPDV ? 'PDV' : 'LOJA',
        value: isPDV ? this.getPDVPricing(store) : 
          await this.melhorEnvio.calculateShipping(store.postalCode, cep)
      };
    }));
  }

  private getPDVPricing(store: Store) {
    return [{
      prazo: `${store.shippingTimeInDays} dias úteis`,
      price: 15.00,
      description: 'Motoboy'
    }];
  }

  // Implementar outros métodos (findAll, findById, findByState)
}