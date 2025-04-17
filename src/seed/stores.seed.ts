// src/seed/stores.seed.ts
import { Injectable } from '@nestjs/common';
import { Store } from '../modules/store/entities/store.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StoreSeedService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>
  ) {}

  async seed() {
    const capitals = [
      // Lista completa de capitais
      { 
        name: 'Dudu Store - AC', 
        city: 'Rio Branco', 
        state: 'AC', 
        postalCode: '69900000', 
        lat: -9.97472, 
        lng: -67.81 },
      { 
        name: 'Dudu Store - AL', 
        city: 'Maceió', 
        state: 'AL', 
        postalCode: '57010000', 
        lat: -9.647684, 
        lng: -35.733926 },
      {
        name: 'Dudu Store - PE',
        city: 'Recife',
        state: 'PE',
        postalCode: '50010000',
        lat: -8.052250,
        lng: -34.928610,
        shippingTimeInDays: 1},
    ];

    await Promise.all(capitals.map(async (capital) => {
      const exists = await this.storeRepository.findOne({ where: { state: capital.state } });
      if (!exists) {
        await this.storeRepository.save({
          name: capital.name,
          city: capital.city,
          state: capital.state,
          postalCode: capital.postalCode,
          latitude: capital.lat,
          longitude: capital.lng,
          shippingTimeInDays: 1,
          type: 'LOJA'
        });
      }
    }));
  }
}