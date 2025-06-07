import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AnalyticsService, AnalyticsOverview } from './analytics.service';

@ApiTags('التحليلات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly svc: AnalyticsService) {}

  @Get('merchant/:id/overview')
  @ApiOperation({ summary: 'الحصول على نظرة عامة بالتحليلات للتاجر' })
  @ApiParam({ name: 'id', type: 'string', description: 'معرّف التاجر' })
  @ApiOkResponse({
    description: 'تم إرجاع نظرة عامة عن التحليلات بنجاح',
    schema: {
      example: {
        totalConversations: 42,
        messagesByChannel: { whatsapp: 30, telegram: 12 },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح (توكن JWT غير صالح أو مفقود)',
  })
  @ApiNotFoundResponse({
    description: 'التاجر غير موجود أو لا توجد بيانات للتحليلات',
  })
  async overview(@Param('id') id: string): Promise<AnalyticsOverview> {
    return this.svc.overview(id);
  }
}

/**
 * النواقص:
 * - يمكن إضافة @ApiForbiddenResponse إذا كان هنالك حق لصلاحيات معينة.
 * - توثيق الحقول التفصيلية لكائن AnalyticsOverview بشكل منفصل في DTO.
 * - إضافة أمثلة أكثر تنوعاً في schema.example لتعكس الحلات المختلفة (عند عدم وجود محادثات مثلاً).
 */
