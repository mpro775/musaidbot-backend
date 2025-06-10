// src/modules/merchants/merchants.controller.ts
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
import { UpdateChannelDto } from './dto/update-channel.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('التجار')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly svc: MerchantsService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء تاجر جديد' })
  @ApiBody({ type: CreateMerchantDto })
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  create(@Body() dto: CreateMerchantDto) {
    return this.svc.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'جلب جميع التجار' })
  @ApiOkResponse()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'جلب تاجر حسب المعرّف' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'تحديث بيانات التاجر' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateMerchantDto })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateMerchantDto,
    @Request() req: RequestWithUser,
  ) {
    const user = req.user;
    if (user.role !== 'ADMIN' && user.userId !== id) {
      throw new HttpException('ممنوع', HttpStatus.FORBIDDEN);
    }
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف التاجر' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @ApiUnauthorizedResponse()
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    const user = req.user;
    if (user.role !== 'ADMIN' && user.userId !== id) {
      throw new HttpException('ممنوع', HttpStatus.FORBIDDEN);
    }
    return this.svc.remove(id);
  }

  @Get(':id/subscription-status')
  @ApiOperation({ summary: 'فحص حالة الاشتراك' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse()
  checkSubscription(@Param('id') id: string) {
    return this.svc.isSubscriptionActive(id).then((active) => ({
      merchantId: id,
      subscriptionActive: active,
    }));
  }

  @Post(':id/channel')
  @ApiOperation({ summary: 'تحديث إعدادات القنوات' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateChannelDto })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  updateChannel(@Param('id') id: string, @Body() dto: UpdateChannelDto) {
    return this.svc.updateChannelConfig(id, dto);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'جلب حالة التاجر التفصيلية' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse()
  @ApiUnauthorizedResponse()
  getStatus(@Param('id') id: string) {
    return this.svc.getStatus(id);
  }
}
