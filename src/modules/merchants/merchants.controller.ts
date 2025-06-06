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

// نستخدم JwtAuthGuard لحماية جميع النقاط
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  // أي شخص لديه توكن صالح يمكنه إنشاء تاجر جديد
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: CreateMerchantDto) {
    return this.merchantsService.create(createDto);
  }

  // جلب جميع التجار (اختياري: يمكن حصر النتائج حسب الدور ADMIN فقط)
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return this.merchantsService.findAll();
  }

  // جلب تاجر حسب ID
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.merchantsService.findOne(id);
  }

  // تحديث بيانات التاجر لكنه مختلف عن دور ADMIN.. مثلاً التاجر نفسه يمكنه تعديل بياناته فقط
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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    const user = req.user;
    if (user.role !== 'ADMIN' && user.userId !== id) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.merchantsService.remove(id);
  }
  // نقطة نهاية للفحص السريع إذا كان الاشتراك مفعل
  @UseGuards(JwtAuthGuard)
  @Get(':id/subscription-status')
  async checkSubscription(@Param('id') id: string) {
    const isActive = await this.merchantsService.isSubscriptionActive(id);
    return { merchantId: id, subscriptionActive: isActive };
  }
}
