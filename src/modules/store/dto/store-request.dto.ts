// src/modules/store/dto/store-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsIn, Matches, Min, Max } from 'class-validator';

export class StoreRequestDto {
  @ApiProperty({ 
    example: '01001000', 
    description: 'CEP no formato 8 dígitos',
    required: true 
  })
  @IsString()
  @Matches(/^\d{8}$/, { message: 'CEP inválido. Deve conter 8 dígitos' })
  cep: string;

  @ApiProperty({
    example: 50,
    description: 'Raio de busca em quilômetros (default: 50)',
    required: false
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(1000)
  radius?: number;

  @ApiProperty({
    enum: ['PDV', 'LOJA'],
    description: 'Filtrar por tipo de loja',
    required: false
  })
  @IsIn(['PDV', 'LOJA'])
  @IsOptional()
  type?: string;
}