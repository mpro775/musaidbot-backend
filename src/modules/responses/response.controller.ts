// src/modules/responses/response.controller.ts
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
} from '@nestjs/common';
import { ResponseService } from './response.service';
import { CreateResponseDto } from './dto/create-response.dto';
import { UpdateResponseDto } from './dto/update-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

@Controller('responses')
export class ResponseController {
  constructor(private readonly responseService: ResponseService) {}

  // جلب كل الردود لهذا التاجر
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Request() req: RequestWithUser) {
    return this.responseService.findAll(req.user.merchantId);
  }

  // إنشاء ردّ جديد
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req: RequestWithUser,
    @Body() dto: CreateResponseDto,
  ) {
    return this.responseService.create(req.user.merchantId, dto);
  }

  // تحديث ردّ موجود (المالك فقط)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateResponseDto,
    @Request() req: RequestWithUser,
  ) {
    // اختياريًّا يمكنك التحقق أن هذا الردّ ينتمي لنفس التاجر:
    // const resp = await this.responseService.findById(id);
    // if (resp.merchantId.toString() !== req.user.merchantId) throw new ForbiddenException();
    console.log(req);
    return this.responseService.update(id, dto);
  }

  // حذف ردّ
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.responseService.remove(id);
  }
}
