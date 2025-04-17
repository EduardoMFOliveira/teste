// src/modules/store/store.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { ViaCEPClient } from '../../shared/clients/viacep.client';
import { GoogleMapsClient } from '../../shared/clients/google-maps.client';
import { MelhorEnvioClient } from '../../shared/clients/melhor-envio.client';
import { DistanceUtil } from '../../shared/utils/distance.util';
import { StoreResponseDto } from './dto/store-response.dto';
import { ConfigService } from '@nestjs/config';
import { CacheUtil } from '../../shared/utils/cache.util';

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);
  private readonly PDV_RADIUS = 50;

  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    private viaCEP: ViaCEPClient,
    private googleMaps: GoogleMapsClient,
    private melhorEnvio: MelhorEnvioClient,
    private configService: ConfigService,
    private cache: CacheUtil
  ) {}

  // Métodos novos para corrigir os erros
  async findAll(): Promise<StoreResponseDto[]> {
    const stores = await this.storeRepository.find();
    return stores.map(store => this.mapToDto(store));
  }

  async findById(id: string): Promise<StoreResponseDto> {
    const store = await this.storeRepository.findOneBy({ id });
    return this.mapToDto(store);
  }

  async findByState(uf: string): Promise<StoreResponseDto[]> {
    const stores = await this.storeRepository.find({ 
      where: { state: uf.toUpperCase() } 
    });
    return stores.map(store => this.mapToDto(store));
  }

  private mapToDto(store: Store): StoreResponseDto {
    return {
      name: store.name,
      city: store.city,
      postalCode: store.postalCode,
      type: store.type,
      distance: '',
      shippingOptions: []
    };
  }

  // Método principal mantido conforme requisitos
  async findNearbyStores(cep: string): Promise<StoreResponseDto[]> {
    const cacheKey = `stores_${cep}`;
    const cached = this.cache.get<StoreResponseDto[]>(cacheKey);
    if (cached) return cached;

    try {
      const address = await this.viaCEP.getAddress(cep);
      const userCoords = await this.googleMaps.getCoordinates(
        `${address.street}, ${address.city}`
      );

      const stores = await this.storeRepository.find();
      const results = await Promise.all(
        stores.map(async store => {
          const distance = await this.calculateDistance(store, userCoords);
          
          return {
            ...this.mapToDto(store),
            distance: DistanceUtil.formatDistance(distance),
            type: distance <= this.PDV_RADIUS ? 'PDV' : 'LOJA',
            shippingOptions: distance <= this.PDV_RADIUS 
              ? this.getPDVShipping(store) 
              : await this.getMelhorEnvioShipping(store.postalCode, cep)
          };
        })
      );

      this.cache.set(cacheKey, results, 300);
      return results;
    } catch (error) {
      this.logger.error(`Erro: ${error.message}`);
      throw error;
    }
  }

  private async calculateDistance(store: Store, userCoords: any): Promise<number> {
    const origin = `${store.latitude},${store.longitude}`;
    const destination = `${userCoords.lat},${userCoords.lng}`;
    return this.googleMaps.calculateDistance(origin, destination);
  }

  private getPDVShipping(store: Store) {
    return [{
      type: 'Motoboy',
      price: 15,
      deliveryTime: `${store.shippingTimeInDays} dia${store.shippingTimeInDays > 1 ? 's' : ''} útil${store.shippingTimeInDays > 1 ? 'es' : ''}`
    }];
  }

  private async getMelhorEnvioShipping(from: string, to: string) {
    try {
      if (!this.melhorEnvio['accessToken']) { // Verifica se está autenticado
        await this.melhorEnvio['authenticate']();
      }
      const options = await this.melhorEnvio.calculateShipping(from, to);
      return options.filter(opt => ['PAC', 'Sedex'].includes(opt.type));
    } catch (error) {
      this.logger.error(`Erro Melhor Envio: ${error.message}`, error.stack);
      return [{
        type: 'Indisponível',
        price: 0,
        deliveryTime: 'Consulte-nos'
      }];
    }
  }
}