// src/modules/store/dto/store-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ShippingOptionDto {
  @ApiProperty({ 
    enum: ['Motoboy', 'Sedex', 'PAC'],
    example: 'Motoboy',
    description: 'Tipo de entrega'
  })
  type: string;

  @ApiProperty({ 
    example: 15.00,
    description: 'Preço do frete'
  })
  price: number;

  @ApiProperty({ 
    example: '1 dia útil',
    description: 'Prazo de entrega estimado'
  })
  deliveryTime: string;
}

export class StoreResponseDto {
  @ApiProperty({ 
    example: 'Loja Central',
    description: 'Nome da loja'
  })
  name: string;

  @ApiProperty({ 
    example: 'São Paulo',
    description: 'Cidade onde a loja está localizada'
  })
  city: string;

  @ApiProperty({ 
    example: '01414001',
    description: 'CEP da loja'
  })
  postalCode: string;

  @ApiProperty({ 
    enum: ['PDV', 'LOJA'],
    example: 'PDV',
    description: 'Tipo de ponto de venda'
  })
  type: string;

  @ApiProperty({ 
    example: '3.1 km',
    description: 'Distância do CEP informado'
  })
  distance: string;

  @ApiProperty({ 
    type: [ShippingOptionDto],
    description: 'Opções de entrega disponíveis'
  })
  shippingOptions: ShippingOptionDto[];
}