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
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TemplateResponseDto } from './dto/template-response.dto';

@ApiTags('التجار')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'إنشاء تاجر جديد' })
  @ApiBody({ type: CreateMerchantDto, description: 'بيانات التاجر الجديد' })
  @ApiCreatedResponse({ description: 'تم إنشاء التاجر بنجاح' })
  @ApiBadRequestResponse({
    description: 'طلب غير صالح: بيانات مفقودة أو تنسيق خاطئ',
  })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح: توكن JWT غير صالح أو مفقود',
  })
  async create(@Body() createDto: CreateMerchantDto) {
    return this.merchantsService.create(createDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'جلب جميع التجار' })
  @ApiOkResponse({ description: 'تم إرجاع قائمة التجار بنجاح' })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح: توكن JWT غير صالح أو مفقود',
  })
  async findAll() {
    return this.merchantsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'معرّف التاجر', type: String })
  @ApiOperation({ summary: 'جلب تاجر حسب المعرّف' })
  @ApiOkResponse({ description: 'تم إرجاع بيانات التاجر بنجاح' })
  @ApiNotFoundResponse({ description: 'التاجر غير موجود' })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح: توكن JWT غير صالح أو مفقود',
  })
  async findOne(@Param('id') id: string) {
    return this.merchantsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'معرّف التاجر', type: String })
  @ApiBody({ type: UpdateMerchantDto, description: 'الحقول المراد تحديثها' })
  @ApiOperation({ summary: 'تحديث بيانات التاجر (المالك أو ADMIN فقط)' })
  @ApiOkResponse({ description: 'تم تحديث بيانات التاجر بنجاح' })
  @ApiForbiddenResponse({ description: 'ممنوع: لا تمتلك صلاحية التحديث' })
  @ApiNotFoundResponse({ description: 'التاجر غير موجود' })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح: توكن JWT غير صالح أو مفقود',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMerchantDto,
    @Request() req: RequestWithUser,
  ) {
    const user = req.user;
    if (user.role !== 'ADMIN' && user.userId !== id) {
      throw new HttpException('ممنوع', HttpStatus.FORBIDDEN);
    }
    return this.merchantsService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'معرّف التاجر', type: String })
  @ApiOperation({ summary: 'حذف تاجر (المالك أو ADMIN فقط)' })
  @ApiOkResponse({ description: 'تم حذف التاجر بنجاح' })
  @ApiForbiddenResponse({ description: 'ممنوع: لا تمتلك صلاحية الحذف' })
  @ApiNotFoundResponse({ description: 'التاجر غير موجود' })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح: توكن JWT غير صالح أو مفقود',
  })
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    const user = req.user;
    if (user.role !== 'ADMIN' && user.userId !== id) {
      throw new HttpException('ممنوع', HttpStatus.FORBIDDEN);
    }
    return this.merchantsService.remove(id);
  }

  @Get(':id/subscription-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'معرّف التاجر', type: String })
  @ApiOperation({ summary: 'فحص حالة الاشتراك للتاجر' })
  @ApiOkResponse({ description: 'تم إرجاع حالة الاشتراك بنجاح' })
  @ApiNotFoundResponse({ description: 'التاجر غير موجود' })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح: توكن JWT غير صالح أو مفقود',
  })
  async checkSubscription(@Param('id') id: string) {
    const isActive = await this.merchantsService.isSubscriptionActive(id);
    return { merchantId: id, subscriptionActive: isActive };
  }

  @Post(':id/channel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'معرّف التاجر', type: String })
  @ApiBody({ type: UpdateChannelDto, description: 'بيانات إعداد القناة' })
  @ApiOperation({ summary: 'تحديث إعدادات القناة للتاجر' })
  @ApiOkResponse({ description: 'تم تحديث إعدادات القناة بنجاح' })
  @ApiNotFoundResponse({ description: 'التاجر غير موجود' })
  async setChannelConfig(
    @Param('id') id: string,
    @Body() dto: UpdateChannelDto,
  ) {
    return this.merchantsService.updateChannelConfig(id, dto);
  }

  @Post(':id/template')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'معرّف التاجر', type: String })
  @ApiBody({ type: CreateTemplateDto, description: 'بيانات القالب الجديد' })
  @ApiOperation({ summary: 'إنشاء قالب جديد للتاجر' })
  @ApiOkResponse({ description: 'تم إنشاء القالب بنجاح' })
  @ApiNotFoundResponse({ description: 'التاجر غير موجود' })
  async createTemplate(
    @Param('id') id: string,
    @Body() dto: CreateTemplateDto,
  ): Promise<TemplateResponseDto> {
    const tpl = await this.merchantsService.createTemplate(id, dto);

    return {
      id: tpl._id.toString(),
      merchantId: tpl.merchantId.toString(),
      name: tpl.name,
      body: tpl.body,
      createdAt: tpl.createdAt,
      updatedAt: tpl.updatedAt,
    };
  }

  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'معرّف التاجر', type: String })
  @ApiOperation({ summary: 'جلب حالة التاجر الحالية' })
  @ApiOkResponse({ description: 'تم إرجاع حالة التاجر بنجاح' })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح: توكن JWT غير صالح أو مفقود',
  })
  async getStatus(@Param('id') id: string) {
    return this.merchantsService.getStatus(id);
  }

  @Put('upgrade')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiBody({
    schema: { example: { planName: 'premium' } },
    description: 'اسم الخطة المراد الترقية إليها',
  })
  @ApiOperation({ summary: 'ترقية خطة التاجر (ROLE MERCHANT فقط)' })
  @ApiOkResponse({ description: 'تمت الترقية بنجاح' })
  @ApiForbiddenResponse({ description: 'ممنوع: ليس لديك دور MERCHANT' })
  @ApiBadRequestResponse({
    description: 'طلب غير صالح أو لا يوجد معرّف للتاجر',
  })
  async upgradePlan(
    @Body('planName') planName: string,
    @Request() req: RequestWithUser,
  ) {
    const user = req.user;
    if (user.role !== 'MERCHANT') {
      throw new HttpException('ممنوع', HttpStatus.FORBIDDEN);
    }
    const merchantId = user.merchantId;
    if (!merchantId) {
      throw new BadRequestException('لا يوجد معرف للتاجر لدى المستخدم');
    }
    const result = await this.merchantsService.upgradePlan(
      merchantId,
      planName,
    );
    return { success: true, ...result };
  }

  @Post(':id/send-test')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'معرّف التاجر', type: String })
  @ApiBody({
    schema: {
      example: {
        templateId: 'tpl123',
        to: '+123456789',
        variables: ['var1', 'var2'],
      },
    },
    description: 'بيانات رسالة الاختبار',
  })
  @ApiOperation({ summary: 'إرسال رسالة تجريبية باستخدام قالب' })
  @ApiOkResponse({ description: 'تم إرسال رسالة الاختبار بنجاح' })
  @ApiNotFoundResponse({ description: 'التاجر أو القالب غير موجود' })
  async sendTest(
    @Param('id') id: string,
    @Body() body: { templateId: string; to: string; variables: string[] },
  ) {
    await this.merchantsService.sendTestMessage(id, body);
    return { success: true };
  }
}

/**
 * النواقص:
 * - يمكن إضافة توثيق لنقطة @Get(':id/subscription-status') مع مثال لعدم وجود اشتراك.
 * - إضافة @ApiForbiddenResponse على العمليات التي تتطلب صلاحيات إضافية.
 * - توصيف Response DTO للقوالب ChannelConfig و Template بشكل منفصل.
 */
