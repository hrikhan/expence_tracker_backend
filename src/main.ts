import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger Config

  const config = new DocumentBuilder()
    .setTitle('Tracker API') // project name
    .setDescription('Simple CRUD + JWT API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // create swagger document
  const document = SwaggerModule.createDocument(app, config);

  // setup swagger route
  SwaggerModule.setup('api', app, document);

  // start server
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`Swagger running at: http://localhost:${port}/api`);
}

bootstrap().catch(console.error);
