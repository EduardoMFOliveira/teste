// src/modules/store/store.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { StoreResponseDto } from './dto/store-response.dto';

@ApiTags('Stores')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get('/by-cep')
  @ApiOperation({ summary: 'Busca lojas por CEP com opções de entrega' })
  @ApiQuery({ name: 'cep', example: '01001000' })
  @ApiResponse({ 
    status: 200, 
    description: 'Retorna lojas PDV ou com opções de frete',
    type: StoreResponseDto 
  })
  async findByCep(@Query('cep') cep: string) {
    return this.storeService.findNearbyStores(cep);
  }

  // Implementar outros endpoints
}