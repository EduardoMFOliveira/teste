// src/modules/store/entities/store.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Store {
  @PrimaryGeneratedColumn('uuid')
  storeID: string;

  @Column()
  storeName: string;

  @Column({ default: true })
  takeOutInStore: boolean;

  @Column()
  shippingTimeInDays: number;

  @Column('float')
  latitude: number;

  @Column('float')
  longitude: number;

  @Column()
  address1: string;

  @Column({ nullable: true })
  address2?: string;

  @Column({ nullable: true })
  address3?: string;

  @Column()
  city: string;

  @Column()
  district: string;

  @Column()
  state: string;

  @Column({ type: 'enum', enum: ['PDV', 'LOJA'] })
  type: string;

  @Column()
  country: string;

  @Column()
  postalCode: string;

  @Column()
  telephoneNumber: string;

  @Column()
  emailAddress: string;
}