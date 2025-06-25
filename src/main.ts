import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { PdfModule } from './pdf/pdf.module';
import * as express from 'express';

const TEMP_PATH = '../tmp';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(PdfModule);

  app.use('/tmp', express.static(join(__dirname, TEMP_PATH)));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
