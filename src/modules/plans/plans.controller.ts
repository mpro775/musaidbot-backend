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
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Plans')
@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  /**
   * @api {post} /plans إنشاء خطة اشتراك جديدة (ADMIN only)
   * @apiName CreatePlan
   * @apiGroup Plans
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} name اسم الخطة.
   * @apiParam {Number} price سعر الخطة (رقم).
   * @apiParam {Number} duration مدّة الخطة بالأيام.
   *
   * @apiSuccess {Object} plan كائن الخطة المنشأة.
   *
   * @apiError (403) Forbidden غير مسموح لغير ADMIN.
   * @apiError (400) BadRequest خطأ في حقول الإدخال.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new subscription plan (ADMIN only)' })
  @ApiResponse({
    status: 201,
    description: 'Plan created successfully.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden: ADMIN only.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() createDto: CreatePlanDto,
    @Request() req: RequestWithUser,
  ) {
    const user = req.user;
    if (user.role !== 'ADMIN') {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.plansService.create(createDto);
  }

  /**
   * @api {get} /plans جلب جميع الخطط المتاحة (Public)
   * @apiName GetAllPlans
   * @apiGroup Plans
   *
   * @apiSuccess {Object[]} plans قائمة بجميع الخطط.
   *
   * @apiError لا توجد.
   */
  @ApiOperation({ summary: 'Get all available plans (public)' })
  @ApiResponse({
    status: 200,
    description: 'List of plans returned.',
  })
  @Get()
  async findAll() {
    return this.plansService.findAll();
  }

  /**
   * @api {get} /plans/:id جلب خطة واحدة حسب معرّف
   * @apiName GetPlanById
   * @apiGroup Plans
   *
   * @apiParam {String} id معرّف الخطة.
   *
   * @apiSuccess {Object} plan كائن الخطة المطلوبة.
   *
   * @apiError (404) NotFound الخطة غير موجودة.
   */
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Plan ID',
  })
  @ApiOperation({ summary: 'Get a single plan by ID' })
  @ApiResponse({ status: 200, description: 'Plan returned.' })
  @ApiResponse({ status: 404, description: 'Plan not found.' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  /**
   * @api {put} /plans/:id تحديث خطة (ADMIN only)
   * @apiName UpdatePlan
   * @apiGroup Plans
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} id معرّف الخطة.
   * @apiParam {String} [name] الاسم الجديد (اختياري).
   * @apiParam {Number} [price] السعر الجديد (اختياري).
   * @apiParam {Number} [duration] المدّة الجديدة بالأيام (اختياري).
   *
   * @apiSuccess {Object} plan كائن الخطة المحدثة.
   *
   * @apiError (403) Forbidden غير مسموح لغير ADMIN.
   * @apiError (404) NotFound الخطة غير موجودة.
   * @apiError (401) Unauthorized توكfailtoken JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Plan ID',
  })
  @ApiOperation({ summary: 'Update a plan (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Plan updated successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: ADMIN only.' })
  @ApiResponse({ status: 404, description: 'Plan not found.' })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePlanDto,
    @Request() req: RequestWithUser,
  ) {
    const user = req.user;
    if (user.role !== 'ADMIN') {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.plansService.update(id, updateDto);
  }

  /**
   * @api {delete} /plans/:id حذف خطة (ADMIN only)
   * @apiName DeletePlan
   * @apiGroup Plans
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} id معرّف الخطة.
   *
   * @apiSuccess {String} message رسالة حذف ناجح.
   *
   * @apiError (403) Forbidden غير مسموح لغير ADMIN.
   * @apiError (404) NotFound الخطة غير موجودة.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Plan ID',
  })
  @ApiOperation({ summary: 'Delete a plan (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Plan deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden: ADMIN only.' })
  @ApiResponse({ status: 404, description: 'Plan not found.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    const user = req.user;
    if (user.role !== 'ADMIN') {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
    return this.plansService.remove(id);
  }
}
