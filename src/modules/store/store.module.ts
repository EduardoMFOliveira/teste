// src/modules/store/store.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { GoogleMapsClient } from '../../shared/clients/google-maps.client';
import { ViaCEPClient } from '../../shared/clients/viacep.client';
import { MelhorEnvioClient } from '../../shared/clients/melhor-envio.client';
import { ConfigModule } from '@nestjs/config';
import { CacheUtil } from '../../shared/utils/cache.util';

@Module({
  imports: [
    TypeOrmModule.forFeature([Store]),
    ConfigModule.forRoot()
  ],
  controllers: [StoreController],
  providers: [
    StoreService,
    GoogleMapsClient,
    ViaCEPClient,
    MelhorEnvioClient,
    CacheUtil
  ],
  exports: [StoreService]
})
export class StoreModule {}