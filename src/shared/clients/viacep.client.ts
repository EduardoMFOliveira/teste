// src/shared/clients/viacep.client.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ViaCEPClient {
  private readonly logger = new Logger(ViaCEPClient.name);
  private readonly BASE_URL = 'https://viacep.com.br/ws';

  async getAddress(cep: string): Promise<{
    cep: string;
    street: string;
    city: string;
    state: string;
    neighborhood: string;
  }> {
    try {
      const response = await axios.get(`${this.BASE_URL}/${cep}/json`);
      
      if (response.data.erro) {
        throw new Error('CEP não encontrado');
      }

      return {
        cep: response.data.cep.replace('-', ''),
        street: response.data.logradouro,
        city: response.data.localidade,
        state: response.data.uf,
        neighborhood: response.data.bairro
      };
    } catch (error) {
      this.logger.error(`Erro no ViaCEP: ${error.message}`);
      throw new Error('Falha na consulta de CEP');
    }
  }
}