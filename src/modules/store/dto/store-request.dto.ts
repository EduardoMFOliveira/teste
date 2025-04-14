// src/modules/store/dto/store-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString,IsNumber,IsOptional,IsIn,Matches,Min,Max } from 'class-validator';

export class StoreRequestDto {
  @ApiProperty({ example: '01001000', required: true })
  @IsString()
  @Matches(/^\d{8}$/, { message: 'CEP deve ter 8 dígitos' })
  cep: string;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(1000)
  radius?: number;

  @ApiProperty({ enum: ['PDV', 'LOJA'], required: false })
  @IsIn(['PDV', 'LOJA'])
  @IsOptional()
  type?: string;
}