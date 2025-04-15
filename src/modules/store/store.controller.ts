// src/modules/store/store.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { StoreResponseDto } from './dto/store-response.dto';
import { StoreRequestDto } from './dto/store-request.dto';

@ApiTags('Stores')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as lojas cadastradas' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lista completa de lojas',
    type: [StoreResponseDto] 
  })
  async listAll(): Promise<StoreResponseDto[]> {
    return this.storeService.findAll();
  }

  @Get('/by-cep')
  @ApiOperation({ summary: 'Buscar lojas próximas por CEP' })
  @ApiResponse({ 
    status: 200,
    description: 'Lojas encontradas no raio de busca',
    type: [StoreResponseDto] 
  })
  async storeByCep(@Query() params: StoreRequestDto): Promise<StoreResponseDto[]> {
    return this.storeService.findNearbyStores(params.cep, params.radius, params.type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar loja por ID' })
  @ApiParam({ name: 'id', description: 'UUID da loja', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiResponse({ 
    status: 200,
    description: 'Detalhes completos da loja',
    type: StoreResponseDto 
  })
  async storeById(@Param('id') id: string): Promise<StoreResponseDto> {
    return this.storeService.findById(id);
  }

  @Get('/state/:uf')
  @ApiOperation({ summary: 'Buscar lojas por estado (UF)' })
  @ApiParam({ name: 'uf', description: 'Sigla do estado', example: 'SP' })
  @ApiResponse({ 
    status: 200,
    description: 'Lojas encontradas no estado',
    type: [StoreResponseDto] 
  })
  async storeByState(@Param('uf') uf: string): Promise<StoreResponseDto[]> {
    return this.storeService.findByState(uf.toUpperCase());
  }
}