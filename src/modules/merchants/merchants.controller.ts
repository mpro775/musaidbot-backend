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
} from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { CreateMerchantDto } from './dto/create-merchant.dto';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  /**
   * @api {post} /merchants إنشاء تاجر جديد
   * @apiName CreateMerchant
   * @apiGroup Merchants
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   *
   * @apiParam {String} name اسم التاجر.
   * @apiParam {String} email ايميل التاجر (يجب أن يكون فريدًا).
   * @apiParam {String} phone رقم هاتف التاجر.
   * @apiParam {String} [logoUrl] رابط شعار التاجر (اختياري).
   * @apiParam {String} [address] عنوان التاجر (اختياري).
   *
   * @apiSuccess {Object} merchant كائن التاجر المنشأ.
   *
   * @apiError (400) BadRequest خطأ في حقول الإدخال.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new merchant' })
  @ApiResponse({
    status: 201,
    description: 'Merchant created successfully.',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: CreateMerchantDto) {
    return this.merchantsService.create(createDto);
  }

  /**
   * @api {get} /merchants جلب جميع التجار
   * @apiName GetAllMerchants
   * @apiGroup Merchants
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   *
   * @apiSuccess {Object[]} merchants قائمة بكل التجار.
   *
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all merchants' })
  @ApiResponse({
    status: 200,
    description: 'List of merchants returned.',
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.merchantsService.findAll();
  }

  /**
   * @api {get} /merchants/:id جلب تاجر حسب معرّف
   * @apiName GetMerchantById
   * @apiGroup Merchants
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} id معرّف التاجر.
   *
   * @apiSuccess {Object} merchant كائن التاجر المطلوب.
   *
   * @apiError (404) NotFound التاجر غير موجود.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Merchant ID',
  })
  @ApiOperation({ summary: 'Get a merchant by ID' })
  @ApiResponse({ status: 200, description: 'Merchant returned.' })
  @ApiResponse({ status: 404, description: 'Merchant not found.' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.merchantsService.findOne(id);
  }

  /**
   * @api {put} /merchants/:id تحديث بيانات التاجر
   * @apiName UpdateMerchant
   * @apiGroup Merchants
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} id معرّف التاجر.
   * @apiParam {String} [name] الاسم الجديد (اختياري).
   * @apiParam {String} [email] الايميل الجديد (اختياري).
   * @apiParam {String} [phone] رقم الهاتف الجديد (اختياري).
   * @apiParam {String} [logoUrl] رابط الشعار الجديد (اختياري).
   * @apiParam {String} [address] العنوان الجديد (اختياري).
   *
   * @apiSuccess {Object} merchant كائن التاجر المحدث.
   *
   * @apiError (403) Forbidden لا تمتلك صلاحية التحديث.
   * @apiError (404) NotFound التاجر غير موجود.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Merchant ID',
  })
  @ApiOperation({ summary: 'Update merchant data (owner or ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Merchant updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Not allowed.' })
  @ApiResponse({ status: 404, description: 'Merchant not found.' })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMerchantDto,
    @Request() req: RequestWithUser,
  ) {
    const user = req.user;
    if (user.role !== 'ADMIN' && user.userId !== id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.merchantsService.update(id, updateDto);
  }

  /**
   * @api {delete} /merchants/:id حذف تاجر
   * @apiName DeleteMerchant
   * @apiGroup Merchants
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} id معرّف التاجر.
   *
   * @apiSuccess {String} message رسالة حذف ناجح.
   *
   * @apiError (403) Forbidden لا تمتلك صلاحية الحذف.
   * @apiError (404) NotFound التاجر غير موجود.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Merchant ID',
  })
  @ApiOperation({ summary: 'Delete a merchant (owner or ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Merchant deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Not allowed.' })
  @ApiResponse({ status: 404, description: 'Merchant not found.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    const user = req.user;
    if (user.role !== 'ADMIN' && user.userId !== id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.merchantsService.remove(id);
  }

  /**
   * @api {get} /merchants/:id/subscription-status فحص حالة الاشتراك
   * @apiName CheckSubscription
   * @apiGroup Merchants
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} id معرّف التاجر.
   *
   * @apiSuccess {Boolean} subscriptionActive true إذا كان الاشتراك فعالاً.
   *
   * @apiError (404) NotFound التاجر غير موجود.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Merchant ID',
  })
  @ApiOperation({ summary: 'Check if merchant subscription is active' })
  @ApiResponse({
    status: 200,
    description: 'Subscription status returned.',
  })
  @ApiResponse({ status: 404, description: 'Merchant not found.' })
  @UseGuards(JwtAuthGuard)
  @Get(':id/subscription-status')
  async checkSubscription(@Param('id') id: string) {
    const isActive = await this.merchantsService.isSubscriptionActive(id);
    return { merchantId: id, subscriptionActive: isActive };
  }
}
