// src/config/configuration.ts
import { z } from 'zod';

const envSchema = z.object({
  DB_NAME: z.string().default('database.sqlite'),
  GOOGLE_MAPS_API_KEY: z.string(),
  MELHOR_ENVIO_ACCESS_TOKEN: z.string(),
  MELHOR_ENVIO_BASE_URL: z.string().url().optional(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PDV_RADIUS: z.coerce.number().default(50),
  PDV_SHIPPING_PRICE: z.coerce.number().default(15),
  APP_NAME: z.string().default('CEP-Store'),
  DEFAULT_PRODUCT_WIDTH: z.coerce.number().default(11),
  DEFAULT_PRODUCT_HEIGHT: z.coerce.number().default(2),
  DEFAULT_PRODUCT_LENGTH: z.coerce.number().default(16),
  DEFAULT_PRODUCT_WEIGHT: z.coerce.number().default(0.3)
});

export type EnvConfig = z.infer<typeof envSchema>;

export default () => {
  try {
    const env = envSchema.parse(process.env);
    
    console.log('✅ Configurações carregadas com sucesso:', {
      DB_NAME: env.DB_NAME,
      PORT: env.PORT,
      NODE_ENV: env.NODE_ENV,
      PDV_RADIUS: `${env.PDV_RADIUS} km`,
      PDV_SHIPPING_PRICE: `R$ ${env.PDV_SHIPPING_PRICE.toFixed(2)}`,
      GOOGLE_MAPS_API_KEY: env.GOOGLE_MAPS_API_KEY ? '✓' : '✗',
      MELHOR_ENVIO_ACCESS_TOKEN: env.MELHOR_ENVIO_ACCESS_TOKEN ? '✓' : '✗',
      MELHOR_ENVIO_BASE_URL: env.MELHOR_ENVIO_BASE_URL || 'https://sandbox.melhorenvio.com.br/api/v2',
      APP_NAME: env.APP_NAME
    });
    
    return { env };
  } catch (error) {
    console.error('❌ Erro na validação das variáveis de ambiente:', error);
    throw error;
  }
};