// src/modules/store/entities/store.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  postalCode: string;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column({ default: 1 })
  shippingTimeInDays: number;

  @Column({ type: 'varchar' })
  type: string;
}