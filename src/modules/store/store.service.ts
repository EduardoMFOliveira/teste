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
import { ShippingOptionDto } from './dto/store-response.dto';

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);
  private readonly PDV_RADIUS: number;
  private readonly PDV_SHIPPING_PRICE: number;

  constructor(
    @InjectRepository(Store) private storeRepository: Repository<Store>,
    private viaCEP: ViaCEPClient,
    private googleMaps: GoogleMapsClient,
    private melhorEnvio: MelhorEnvioClient,
    private configService: ConfigService,
    private cache: CacheUtil
  ) {
    this.PDV_RADIUS = this.configService.get<number>('PDV_RADIUS', 50);
    this.PDV_SHIPPING_PRICE = this.configService.get<number>('PDV_SHIPPING_PRICE', 15);
  }

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

  async findNearbyStores(cep: string, radius?: number): Promise<StoreResponseDto[]> {
    const effectiveRadius = radius ?? this.PDV_RADIUS;
    const cacheKey = `stores_${cep}_${effectiveRadius}`;
    
    const cached = this.cache.get<StoreResponseDto[]>(cacheKey);
    if (cached) return cached;

    try {
      const address = await this.viaCEP.getAddress(cep);
      const userCoords = await this.googleMaps.getCoordinates(`${address.street}, ${address.city}`);
      const stores = await this.storeRepository.find();

      const results = await Promise.all(
        stores.map(async store => {
          try {
            const origin = `${store.latitude},${store.longitude}`;
            const destination = `${userCoords.lat},${userCoords.lng}`;
            
            const { distance, duration } = await this.googleMaps.calculateDistance(origin, destination);
            
            const storeType = distance <= effectiveRadius ? 'PDV' : 'LOJA';
            const shippingOptions = storeType === 'PDV'
              ? this.getPDVShipping(duration)
              : await this.getMelhorEnvioShipping(store.postalCode, cep);

            return {
              ...this.mapToDto(store),
              distance: DistanceUtil.formatDistance(distance),
              type: storeType,
              shippingOptions
            };
          } catch (error) {
            this.logger.error(`Erro processando loja ${store.id}: ${error.message}`);
            return null;
          }
        })
      );

      const filteredResults = results.filter(r => r !== null);
      this.cache.set(cacheKey, filteredResults, 300);
      return filteredResults;
    } catch (error) {
      this.logger.error(`Erro ao buscar lojas próximas: ${error.message}`);
      throw error;
    }
  }

  private getPDVShipping(durationSeconds: number): ShippingOptionDto[] {
    const hours = durationSeconds / 3600;
    let estimatedDays = Math.ceil(hours / 24);
    if (estimatedDays < 1) estimatedDays = 1;
    
    return [{
      type: 'Motoboy',
      price: this.PDV_SHIPPING_PRICE,
      deliveryTime: `${estimatedDays} dia${estimatedDays > 1 ? 's' : ''} útil${estimatedDays > 1 ? 'es' : ''}`
    }];
  }

  private async getMelhorEnvioShipping(from: string, to: string) {
    try {
      const options = await this.melhorEnvio.calculateShipping(from, to);
      return options.filter(opt => ['PAC', 'Sedex'].includes(opt.type));
    } catch (error) {
      this.logger.error(`Erro Melhor Envio: ${error.message}`);
      return [{
        type: 'Indisponível',
        price: 0,
        deliveryTime: 'Consulte-nos'
      }];
    }
  }
}