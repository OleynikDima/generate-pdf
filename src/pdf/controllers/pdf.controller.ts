import { Body, Controller, Post } from '@nestjs/common';
import { GeneratePdfDto } from '../dto/pdf.dto';
import { PdfService } from '../services/pdf.service';

@Controller('pdf')
export class PdfController {
  constructor(private generatePdfService: PdfService) {}

  @Post('/generate')
  generatePdf(@Body() generatePdfDto: GeneratePdfDto) {
    return this.generatePdfService.runGeneratePdf(generatePdfDto);
  }
}
