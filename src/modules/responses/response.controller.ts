import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ResponseService } from './response.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ResponseResponseDto } from './dto/response-response.dto';

@ApiTags('الردود التلقائية')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('responses')
export class ResponseController {
  constructor(private readonly responseService: ResponseService) {}

  @Get()
  @ApiOperation({ summary: 'جلب جميع الردود التلقائية للتاجر الحالي' })
  @ApiOkResponse({
    description: 'تم إرجاع قائمة الردود بنجاح',
    type: ResponseResponseDto,
    isArray: true,
  })
  @ApiBadRequestResponse({
    description: 'طلب غير صالح: معرف التاجر غير موجود في التوكن',
  })
  async findAll(
    @Request() req: RequestWithUser,
  ): Promise<ResponseResponseDto[]> {
    const merchantId = req.user.merchantId;
    if (!merchantId) {
      throw new BadRequestException('معرّف التاجر مفقود في التوكن');
    }
    const items = await this.responseService.findAll(merchantId);
    return items.map((r) => ({
      _id: r._id.toString(),
      merchantId: r.merchantId.toString(),
      keyword: r.keyword,
      replyText: r.replyText,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  @Post()
  @ApiOperation({ summary: 'إنشاء رد تلقائي جديد' })
  @ApiBody({
    type: CreateResponseDto,
    description: 'بيانات الرد: الكلمة المفتاحية ونص الرد',
  })
  @ApiCreatedResponse({
    description: 'تم إنشاء الرد بنجاح',
    type: ResponseResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'طلب غير صالح: المدخلات خاطئة أو الكلمة المفتاحية موجودة مسبقاً',
  })
  async create(
    @Request() req: RequestWithUser,
    @Body() dto: CreateResponseDto,
  ): Promise<ResponseResponseDto> {
    const merchantId = req.user.merchantId;
    if (!merchantId) {
      throw new BadRequestException('معرّف التاجر مفقود في التوكن');
    }
    const r = await this.responseService.create(merchantId, dto);
    return {
      _id: r._id.toString(),
      merchantId: r.merchantId.toString(),
      keyword: r.keyword,
      replyText: r.replyText,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  @Patch(':id')
  @ApiParam({ name: 'id', type: 'string', description: 'معرّف الرد' })
  @ApiOperation({ summary: 'تحديث رد تلقائي موجود (لصاحب الرد فقط)' })
  @ApiBody({ type: UpdateResponseDto, description: 'الحقول المراد تعديلها' })
  @ApiOkResponse({
    description: 'تم تحديث الرد بنجاح',
    type: ResponseResponseDto,
  })
  @ApiForbiddenResponse({ description: 'ممنوع: ليس مالك الرد' })
  @ApiNotFoundResponse({ description: 'الرد غير موجود' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateResponseDto,
    @Request() req: RequestWithUser,
  ): Promise<ResponseResponseDto> {
    const merchantId = req.user.merchantId;
    if (!merchantId) {
      throw new BadRequestException('معرّف التاجر مفقود في التوكن');
    }
    const r = await this.responseService.update(id, dto, merchantId);
    return {
      _id: r._id.toString(),
      merchantId: r.merchantId.toString(),
      keyword: r.keyword,
      replyText: r.replyText,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: 'string', description: 'معرّف الرد' })
  @ApiOperation({ summary: 'حذف رد تلقائي (لصاحب الرد فقط)' })
  @ApiOkResponse({ description: 'تم حذف الرد بنجاح' })
  @ApiForbiddenResponse({ description: 'ممنوع: ليس مالك الرد' })
  @ApiNotFoundResponse({ description: 'الرد غير موجود' })
  async remove(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const merchantId = req.user.merchantId;
    if (!merchantId) {
      throw new BadRequestException('معرّف التاجر مفقود في التوكن');
    }
    return this.responseService.remove(id, merchantId);
  }
}

/**
 * النواقص:
 * - إضافة @ApiUnauthorizedResponse لحالات التوكن غير الصالح أو المفقود.
 * - يمكن إضافة مثال لبيانات ResponseResponseDto باستخدام schema.example.
 * - توصيف دقيق لحقول UpdateResponseDto وCreateResponseDto (مثل طول النص وغيرها).
 */
