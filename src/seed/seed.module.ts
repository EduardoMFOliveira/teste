// src/seed/seed.module.ts
import { Module } from '@nestjs/common';
import { StoreSeedService } from './stores.seed';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Store } from '../modules/store/entities/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Store])],
  providers: [StoreSeedService],
})
export class SeedModule {}