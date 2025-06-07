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
import { ProductResponseDto } from './dto/product-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { Types } from 'mongoose';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product (for merchant)' })
  @ApiCreatedResponse({
    description: 'Product created and queued for scraping.',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient role.' })
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
      merchantId: merchantObjectId, // الآن متعلق بـ ObjectId لا بـ string
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
    // حوّل returned document إلى DTO تلقائيًا
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
  @ApiOperation({ summary: 'Get all products for current merchant' })
  @ApiOkResponse({
    description: 'List of products returned.',
    type: ProductResponseDto,
    isArray: true,
  })
  @ApiResponse({ status: 403, description: 'Forbidden: Insufficient role.' })
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
  @ApiOperation({ summary: 'Get a single product by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiOkResponse({ type: ProductResponseDto, description: 'Product returned.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Not owner.' })
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
  @ApiOperation({ summary: 'Update a product (owner only)' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiOkResponse({
    type: ProductResponseDto,
    description: 'Product updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Not owner.' })
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
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiOkResponse({ description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden: Not owner.' })
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
