// src/modules/store/store.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { ViaCEPClient } from '../../shared/clients/viacep.client';
import { GoogleMapsClient } from '../../shared/clients/google-maps.client';
import { MelhorEnvioClient } from '../../shared/clients/melhor-envio.client';
import { DistanceUtil } from '../../shared/utils/distance.util';
import { ConfigService } from '@nestjs/config';
import { CacheUtil } from '../../shared/utils/cache.util';
import { StoreResponseDto } from './dto/store-response.dto';

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);
  private readonly pdvRadius: number;
  private readonly pdvPrice: number;

  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    private viaCEP: ViaCEPClient,
    private googleMaps: GoogleMapsClient,
    private melhorEnvio: MelhorEnvioClient,
    private configService: ConfigService,
    private cache: CacheUtil
  ) {
    this.pdvRadius = this.configService.get<number>('PDV_RADIUS');
    this.pdvPrice = this.configService.get<number>('PDV_SHIPPING_PRICE');
  }

  async findAll(): Promise<StoreResponseDto[]> {
    const stores = await this.storeRepository.find();
    return stores.map(store => this.mapToResponseDto(store));
  }

  async findById(id: string): Promise<StoreResponseDto> {
    const store = await this.storeRepository.findOneBy({ storeID: id });
    return this.mapToResponseDto(store);
  }

  async findByState(uf: string): Promise<StoreResponseDto[]> {
    const stores = await this.storeRepository.find({ where: { state: uf.toUpperCase() } });
    return stores.map(store => this.mapToResponseDto(store));
  }

  async findNearbyStores(cep: string, radius?: number, type?: string): Promise<StoreResponseDto[]> {
    const cacheKey = `stores_${cep}_${radius || 'all'}_${type || 'all'}`;
    const cached = this.cache.get<StoreResponseDto[]>(cacheKey);
    if (cached) return cached;

    try {
      const address = await this.viaCEP.getAddress(cep);
      const userCoords = await this.googleMaps.getCoordinates(
        `${address.street}, ${address.city}`
      );

      const stores = await this.storeRepository.find();
      const processedStores = await this.processStores(stores, userCoords, cep, radius);
      const filteredStores = this.filterStores(processedStores, type);
      
      this.cache.set(cacheKey, filteredStores, 300);
      return filteredStores;
    } catch (error) {
      this.logger.error(`CEP: ${cep} - ${error.message}`);
      throw error;
    }
  }

  private mapToResponseDto(store: Store): StoreResponseDto {
    return {
      name: store.storeName,
      city: store.city,
      postalCode: store.postalCode,
      type: store.type,
      distance: '',
      shippingOptions: []
    };
  }

  private async processStores(stores: Store[], userCoords: any, cep: string, radius?: number) {
    return Promise.all(stores.map(async store => {
      const distance = DistanceUtil.haversineDistance(
        userCoords.lat,
        userCoords.lng,
        store.latitude,
        store.longitude
      );

      const isPDV = distance <= this.pdvRadius;
      const shouldInclude = !radius || distance <= radius;

      if (!shouldInclude) return null;

      const baseDto = this.mapToResponseDto(store);
      
      return {
        ...baseDto,
        distance: DistanceUtil.formatDistance(distance),
        type: isPDV ? 'PDV' : 'LOJA',
        shippingOptions: isPDV
          ? [{
              type: 'Motoboy',
              price: this.pdvPrice,
              deliveryTime: `${store.shippingTimeInDays} dias úteis`
            }]
          : await this.getShippingOptions(store.postalCode, cep)
      };
    }));
  }

  private async getShippingOptions(from: string, to: string) {
    try {
      const options = await this.melhorEnvio.calculateShipping(from, to);
      return options.filter(opt => ['Sedex', 'PAC'].includes(opt.type));
    } catch (error) {
      this.logger.error('Erro ao calcular fretes', error.stack);
      return [];
    }
  }

  private filterStores(stores: (StoreResponseDto | null)[], type?: string) {
    return stores
      .filter(store => store !== null)
      .filter(store => !type || store.type === type);
  }
}