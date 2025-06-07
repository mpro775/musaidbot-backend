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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
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
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Types } from 'mongoose';

@ApiTags('المنتجات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء منتج جديد (للتاجر)' })
  @ApiBody({ type: CreateProductDto, description: 'بيانات إنشاء المنتج' })
  @ApiCreatedResponse({
    description: 'تم إنشاء المنتج ووضعه في قائمة الانتظار للمعالجة',
    type: ProductResponseDto,
  })
  @ApiForbiddenResponse({ description: 'ممنوع: دور المستخدم غير كافٍ' })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح: توكن JWT غير صالح أو مفقود',
  })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: RequestWithUser,
    @Body() dto: CreateProductDto,
  ): Promise<ProductResponseDto> {
    if (req.user.role !== 'MERCHANT' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Insufficient role');
    }
    const merchantId = req.user.merchantId!;
    const merchantObjectId = new Types.ObjectId(merchantId);

    const productDoc = await this.productsService.create({
      merchantId: merchantObjectId,
      originalUrl: dto.originalUrl,
      name: dto.name ?? '',
      price: dto.price ?? 0,
      isAvailable: dto.isAvailable ?? true,
      keywords: dto.keywords ?? [],
      errorState: 'queued',
    });
    await this.productsService.enqueueScrapeJob({
      productId: productDoc._id.toString(),
      url: dto.originalUrl,
      merchantId,
    });
    return {
      _id: productDoc._id.toString(),
      merchantId: productDoc.merchantId.toString(),
      originalUrl: productDoc.originalUrl,
      name: productDoc.name,
      price: productDoc.price,
      isAvailable: productDoc.isAvailable,
      keywords: productDoc.keywords,
    };
  }

  @Get()
  @ApiOperation({ summary: 'جلب جميع المنتجات للتاجر الحالي' })
  @ApiOkResponse({
    description: 'تم إرجاع قائمة المنتجات بنجاح',
    type: ProductResponseDto,
    isArray: true,
  })
  @ApiForbiddenResponse({ description: 'ممنوع: دور المستخدم غير كافٍ' })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح: توكن JWT غير صالح أو مفقود',
  })
  async findAll(
    @Request() req: RequestWithUser,
  ): Promise<ProductResponseDto[]> {
    if (req.user.role !== 'MERCHANT' && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Insufficient role');
    }
    const products = await this.productsService.findAllByMerchant(
      req.user.merchantId!,
    );
    return products.map((p) => ({
      _id: p._id.toString(),
      merchantId: p.merchantId.toString(),
      originalUrl: p.originalUrl,
      name: p.name,
      price: p.price,
      isAvailable: p.isAvailable,
      keywords: p.keywords,
    }));
  }

  @Get(':id')
  @ApiParam({ name: 'id', type: 'string', description: 'معرّف المنتج' })
  @ApiOperation({ summary: 'جلب منتج واحد حسب المعرّف' })
  @ApiOkResponse({
    description: 'تم إرجاع بيانات المنتج بنجاح',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({ description: 'المنتج غير موجود' })
  @ApiForbiddenResponse({ description: 'ممنوع: ليس مالك المنتج' })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح: توكن JWT غير صالح أو مفقود',
  })
  async findOne(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.findOne(id);
    if (
      req.user.role !== 'ADMIN' &&
      product.merchantId.toString() !== req.user.merchantId
    ) {
      throw new ForbiddenException('Not allowed');
    }
    return {
      _id: product._id.toString(),
      merchantId: product.merchantId.toString(),
      originalUrl: product.originalUrl,
      name: product.name,
      price: product.price,
      isAvailable: product.isAvailable,
      keywords: product.keywords,
    };
  }

  @Put(':id')
  @ApiParam({ name: 'id', type: 'string', description: 'معرّف المنتج' })
  @ApiOperation({ summary: 'تحديث منتج (لصاحب المنتج فقط)' })
  @ApiBody({ type: UpdateProductDto, description: 'الحقول المراد تحديثها' })
  @ApiOkResponse({
    description: 'تم تحديث المنتج بنجاح',
    type: ProductResponseDto,
  })
  @ApiNotFoundResponse({ description: 'المنتج غير موجود' })
  @ApiForbiddenResponse({ description: 'ممنوع: ليس مالك المنتج' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Request() req: RequestWithUser,
  ): Promise<ProductResponseDto> {
    const product = await this.productsService.findOne(id);
    if (
      req.user.role !== 'ADMIN' &&
      product.merchantId.toString() !== req.user.merchantId
    ) {
      throw new ForbiddenException('Not allowed');
    }
    const updated = await this.productsService.update(id, dto);
    return {
      _id: updated._id.toString(),
      merchantId: updated.merchantId.toString(),
      originalUrl: updated.originalUrl,
      name: updated.name,
      price: updated.price,
      isAvailable: updated.isAvailable,
      keywords: updated.keywords,
    };
  }

  @Delete(':id')
  @ApiParam({ name: 'id', type: 'string', description: 'معرّف المنتج' })
  @ApiOperation({ summary: 'حذف منتج' })
  @ApiOkResponse({ description: 'تم حذف المنتج بنجاح' })
  @ApiNotFoundResponse({ description: 'المنتج غير موجود' })
  @ApiForbiddenResponse({ description: 'ممنوع: ليس مالك المنتج' })
  async remove(
    @Param('id') id: string,
    @Request() req: RequestWithUser,
  ): Promise<{ message: string }> {
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

/**
 * النواقص:
 * - إضافة @ApiUnauthorizedResponse على جميع النقاط التي تتطلب التوكن.
 * - يمكن إضافة أمثلة JSON في ApiCreatedResponse وApiOkResponse باستخدام schema.example.
 * - توصيف Response DTO (ProductResponseDto) بشكل منفصل لعرض الحقول والتنسيق.
 */
