// src/modules/templates/templates.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Template, TemplateSchema } from './schemas/template.schema';
import { TemplatesService } from './templates.service';
import { TemplatesController } from './templates.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Template.name, schema: TemplateSchema },
    ]),
  ],
  providers: [TemplatesService],
  controllers: [TemplatesController],
  exports: [TemplatesService], // لحقنها في خدمات أخرى
})
export class TemplatesModule {}
