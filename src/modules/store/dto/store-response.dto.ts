// src/modules/store/dto/store-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ShippingOptionDto {
  @ApiProperty({ example: '1 dias úteis' })
  prazo: string;

  @ApiProperty({ example: 'R$ 15,00' })
  price: string;

  @ApiProperty({ example: 'Motoboy' })
  description: string;
}

export class StoreResponseDto {
  @ApiProperty({ example: 'Loja Central' })
  name: string;

  @ApiProperty({ example: 'São Paulo' })
  city: string;

  @ApiProperty({ example: '01414001' })
  postalCode: string;

  @ApiProperty({ enum: ['PDV', 'LOJA'] })
  type: string;

  @ApiProperty({ example: '3.1 km' })
  distance: string;

  @ApiProperty({ type: [ShippingOptionDto] })
  value: ShippingOptionDto[];
}