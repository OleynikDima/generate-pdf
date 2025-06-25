import { Module } from '@nestjs/common';
import { PdfController } from './controllers/pdf.controller';
import { PdfService } from './services/pdf.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [PdfController],
  providers: [PdfService],
})
export class PdfModule {}
