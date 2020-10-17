import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { PdfController } from './pdf.controller';
import { PdfService } from './pdf.service';

@Module({ imports: [ConfigModule.forRoot()],
  controllers: [PdfController],
  providers: [PdfService]
})
export class PdfModule {}
