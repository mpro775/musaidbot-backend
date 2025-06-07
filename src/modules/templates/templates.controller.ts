import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CreateTemplateDto } from '../merchants/dto/create-template.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { TrialGuard } from 'src/common/guards/trial.guard';
import { TemplatesService } from './templates.service';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('القوالب')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TrialGuard)
@Controller()
export class TemplatesController {
  constructor(private readonly svc: TemplatesService) {}

  @Post('merchants/:id/templates')
  @ApiOperation({ summary: 'إنشاء قالب جديد لتاجر' })
  @ApiParam({ name: 'id', description: 'معرّف التاجر', type: String })
  @ApiBody({
    type: CreateTemplateDto,
    description: 'بيانات القالب: الاسم والنص',
  })
  @ApiCreatedResponse({ description: 'تم إنشاء القالب بنجاح' })
  @ApiForbiddenResponse({
    description: 'ممنوع: لا تمتلك صلاحية أو انتهت الفترة التجريبية',
  })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح: توكن JWT غير صالح أو مفقود',
  })
  async create(
    @Param('id') merchantId: string,
    @Body() dto: CreateTemplateDto,
  ) {
    return this.svc.create(merchantId, dto);
  }

  @Get('merchants/:id/templates')
  @ApiOperation({ summary: 'جلب جميع القوالب لتاجر محدد' })
  @ApiParam({ name: 'id', description: 'معرّف التاجر', type: String })
  @ApiOkResponse({
    description: 'تم إرجاع قائمة القوالب بنجاح',
    type: CreateTemplateDto,
    isArray: true,
  })
  @ApiForbiddenResponse({
    description: 'ممنوع: صلاحيات التجربة انتهت أو ليس تاجرًا',
  })
  async findAll(@Param('id') merchantId: string) {
    return this.svc.findAll(merchantId);
  }

  @Put('templates/:tid')
  @ApiOperation({ summary: 'تحديث قالب موجود' })
  @ApiParam({ name: 'tid', description: 'معرّف القالب', type: String })
  @ApiBody({
    type: CreateTemplateDto,
    description: 'الحقول المراد تحديثها للقالب',
  })
  @ApiOkResponse({ description: 'تم تحديث القالب بنجاح' })
  @ApiNotFoundResponse({ description: 'القالب غير موجود' })
  @ApiForbiddenResponse({
    description: 'ممنوع: لا تمتلك صلاحية أو انتهت الفترة التجريبية',
  })
  async update(@Param('tid') tid: string, @Body() dto: CreateTemplateDto) {
    return this.svc.update(tid, dto);
  }

  @Delete('templates/:tid')
  @ApiOperation({ summary: 'حذف قالب موجود' })
  @ApiParam({ name: 'tid', description: 'معرّف القالب', type: String })
  @ApiOkResponse({ description: 'تم حذف القالب بنجاح' })
  @ApiNotFoundResponse({ description: 'القالب غير موجود' })
  @ApiForbiddenResponse({
    description: 'ممنوع: لا تمتلك صلاحية أو انتهت الفترة التجريبية',
  })
  async remove(@Param('tid') tid: string) {
    return this.svc.remove(tid);
  }
}

/**
 * النواقص:
 * - إضافة ApiUnauthorizedResponse لجميع النقاط المحمية.
 * - يمكن إضافة schema.example في استجابات الإنشاء والتحديث لتوضيح هيكل JSON.
 * - توثيق دقيق لحقل CreateTemplateDto (طول الاسم، تنسيق النص).
 */
