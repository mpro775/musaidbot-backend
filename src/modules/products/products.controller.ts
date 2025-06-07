// src/modules/products/products.controller.ts

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
  ForbiddenException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * @api {post} /products إضافة منتج جديد للتاجر
   * @apiName CreateProduct
   * @apiGroup Products
   *
   * @apiHeader {String} Authorization توكن JWT من نوع Bearer (مخصَّص للتاجر).
   *
   * @apiParam {String} originalUrl الرابط الأصلي لصفحة المنتج.
   * @apiParam {String} [name] اسم المنتج (اختياريّ).
   * @apiParam {Number} [price] السعر المبدئي (اختياريّ).
   * @apiParam {Boolean} [isAvailable] حالة التوفر (اختياريّ، افتراضيًّا true).
   * @apiParam {String[]} [keywords] قائمة كلمات مفتاحية (اختياريّ).
   *
   * @apiSuccess {String} productId معرّف المنتج الجديد.
   *
   * @apiError (403) Forbidden عدم امتلاك دور MERCHANT أو ADMIN.
   * @apiError (401) Unauthorized توكن JWT مفقود أو غير صالح.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (for merchant)' })
  @ApiResponse({
    status: 201,
    description: 'Product created and queued for scraping.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient role.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: RequestWithUser, @Body() dto: CreateProductDto) {
    // فقط الدور MERCHANT أو ADMIN يُسمح له
    if (req.user.role !== 'MERCHANT' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Insufficient role');
    }

    const merchantId = req.user.merchantId;

    // 1. إنشاء السجل الابتدائي للمنتج
    const productDoc = await this.productsService.create({
      merchantId,
      originalUrl: dto.originalUrl,
      name: dto.name || '',
      price: dto.price || 0,
      isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : true,
      keywords: dto.keywords || [],
      errorState: 'queued',
    });

    // الآن هذا مضمون ✅
    await this.productsService.enqueueScrapeJob({
      productId: productDoc._id.toString(), // ✅ لن يظهر الخطأ الآن
      url: dto.originalUrl,
      merchantId,
    });

    return { productId: productDoc._id };
  }

  /**
   * @api {get} /products جلب جميع المنتجات الخاصة بالتاجر الحالي
   * @apiName GetAllProducts
   * @apiGroup Products
   *
   * @apiHeader {String} Authorization توكن JWT من نوع Bearer.
   *
   * @apiSuccess {Object[]} products قائمة المنتجات.
   *
   * @apiError (403) Forbidden عدم امتلاك دور MERCHANT أو ADMIN.
   * @apiError (401) Unauthorized توكن JWT مفقود أو غير صالح.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all products for current merchant' })
  @ApiResponse({ status: 200, description: 'List of products returned.' })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: RequestWithUser) {
    if (req.user.role !== 'MERCHANT' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Insufficient role');
    }
    return this.productsService.findAllByMerchant(req.user.merchantId);
  }

  /**
   * @api {get} /products/:id جلب منتج واحد حسب معرّف
   * @apiName GetProductById
   * @apiGroup Products
   *
   * @apiHeader {String} Authorization توكن JWT من نوع Bearer.
   * @apiParam {String} id معرّف المنتج.
   *
   * @apiSuccess {Object} product كائن المنتج المطلوب.
   *
   * @apiError (404) NotFound المنتج غير موجود.
   * @apiError (403) Forbidden عدم امتلاك دور/ملكيّة مناسبة (MERCHANT أو ADMIN).
   * @apiError (401) Unauthorized توكن JWT مفقود أو غير صالح.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Product ID',
  })
  @ApiOperation({ summary: 'Get a single product by ID' })
  @ApiResponse({ status: 200, description: 'Product returned.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    const product = await this.productsService.findOne(id);

    // التحقّق من أنّ المنتج ينتمي لهذا التاجر أو أن المستخدم ADMIN
    if (
      req.user.role !== 'ADMIN' &&
      product.merchantId.toString() !== req.user.merchantId
    ) {
      throw new ForbiddenException('Not allowed');
    }
    return product;
  }

  /**
   * @api {put} /products/:id تحديث منتج (المالك فقط)
   * @apiName UpdateProduct
   * @apiGroup Products
   *
   * @apiHeader {String} Authorization توكن JWT من نوع Bearer.
   * @apiParam {String} id معرّف المنتج.
   * @apiParam {String} [name] الاسم الجديد (اختياري).
   * @apiParam {Number} [price] السعر الجديد (اختياري).
   * @apiParam {Boolean} [isAvailable] حالة التوفر الجديدة (اختياري).
   * @apiParam {String[]} [keywords] كلمات مفتاحية جديدة (اختياري).
   * @apiParam {String} [errorState] حالة الخطأ (اختياري).
   * @apiParam {String[]} [images] روابط جديدة للصورة (اختياري).
   *
   * @apiSuccess {Object} product المنتج بعد التحديث.
   *
   * @apiError (404) NotFound المنتج غير موجود.
   * @apiError (403) Forbidden عدم امتلاك دور/ملكيّة مناسبة.
   * @apiError (401) Unauthorized توكن JWT مفقود أو غير صالح.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Product ID',
  })
  @ApiOperation({ summary: 'Update a product (owner only)' })
  @ApiResponse({ status: 200, description: 'Product updated successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Request() req: RequestWithUser,
  ) {
    const product = await this.productsService.findOne(id);
    if (
      req.user.role !== 'ADMIN' &&
      product.merchantId.toString() !== req.user.merchantId
    ) {
      throw new ForbiddenException('Not allowed');
    }
    return this.productsService.update(id, dto);
  }

  /**
   * @api {delete} /products/:id حذف منتج
   * @apiName DeleteProduct
   * @apiGroup Products
   *
   * @apiHeader {String} Authorization توكن JWT من نوع Bearer.
   * @apiParam {String} id معرّف المنتج.
   *
   * @apiSuccess {String} message رسالة نجاح الحذف.
   *
   * @apiError (404) NotFound المنتج غير موجود.
   * @apiError (403) Forbidden عدم امتلاك دور/ملكيّة مناسبة.
   * @apiError (401) Unauthorized توكن JWT مفقود أو غير صالح.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Product ID',
  })
  @ApiOperation({ summary: 'Delete a product' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    const product = await this.productsService.findOne(id);
    if (
      req.user.role !== 'ADMIN' &&
      product.merchantId.toString() !== req.user.merchantId
    ) {
      throw new ForbiddenException('Not allowed');
    }
    return this.productsService.remove(id);
  }
}
