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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
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
   * @api {post} /products إنشاء منتج جديد
   * @apiName CreateProduct
   * @apiGroup Products
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   *
   * @apiParam {String} name اسم المنتج.
   * @apiParam {Number} price سعر المنتج.
   * @apiParam {String} [description] وصف المنتج (اختياري).
   * @apiParam {Boolean} [isAvailable] حالة التوفر (اختياري).
   *
   * @apiSuccess {Object} product كائن المنتج المنشأ.
   *
   * @apiError (400) BadRequest خطأ في حقول الإدخال.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDto: CreateProductDto, @Request() req: RequestWithUser) {
    return this.productsService.create(createDto, req.user.userId);
  }

  /**
   * @api {get} /products جلب جميع المنتجات للتاجر الحالي
   * @apiName GetAllProducts
   * @apiGroup Products
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   *
   * @apiSuccess {Object[]} products قائمة المنتجات الخاصة بالتاجر.
   *
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all products for current merchant' })
  @ApiResponse({ status: 200, description: 'List of products returned.' })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: RequestWithUser) {
    return this.productsService.findAll(req.user.userId);
  }

  /**
   * @api {get} /products/:id جلب منتج واحد حسب معرّف
   * @apiName GetProductById
   * @apiGroup Products
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} id معرّف المنتج.
   *
   * @apiSuccess {Object} product كائن المنتج المطلوب.
   *
   * @apiError (404) NotFound المنتج غير موجود.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
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
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  /**
   * @api {put} /products/:id تحديث منتج (المُنشئ فقط)
   * @apiName UpdateProduct
   * @apiGroup Products
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} id معرّف المنتج.
   * @apiParam {String} [name] الاسم الجديد (اختياري).
   * @apiParam {Number} [price] السعر الجديد (اختياري).
   * @apiParam {String} [description] الوصف الجديد (اختياري).
   * @apiParam {Boolean} [isAvailable] حالة التوفر الجديدة (اختياري).
   *
   * @apiSuccess {Object} product كائن المنتج المحدث.
   *
   * @apiError (404) NotFound المنتج غير موجود.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
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
  update(@Param('id') id: string, @Body() updateDto: UpdateProductDto) {
    return this.productsService.update(id, updateDto);
  }

  /**
   * @api {delete} /products/:id حذف منتج
   * @apiName DeleteProduct
   * @apiGroup Products
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} id معرّف المنتج.
   *
   * @apiSuccess {String} message رسالة حذف ناجح.
   *
   * @apiError (404) NotFound المنتج غير موجود.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
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
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
