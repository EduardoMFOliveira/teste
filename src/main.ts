// src/main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { StoreSeedService } from './seed/stores.seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Dudu Store e Delivery')
    .setDescription('API para gestão das lojas Dudu Store em todas as capitais do Brasil')
    .setVersion('1.0')
    .addTag('stores')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Executa o seed das lojas
  const seeder = app.get(StoreSeedService);
  await seeder.seed()
    .then(() => console.log('✅ Lojas cadastradas com sucesso'))
    .catch(error => console.error('❌ Erro ao cadastrar lojas:', error));

  // Inicia o servidor
  await app.listen(process.env.PORT || 3000);
  
  console.log(`\n🛍️  Dudu Stores API está rodando em: ${await app.getUrl()}`);
  console.log(`📚 Documentação disponível em: ${await app.getUrl()}/api`);
}

bootstrap();