import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * @api {get} /users جلب جميع المستخدمين
   * @apiName GetAllUsers
   * @apiGroup Users
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   *
   * @apiSuccess {Object[]} users قائمة المستخدمين.
   *
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users returned.' })
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * @api {get} /users/:id جلب مستخدم واحد حسب معرّف
   * @apiName GetUserById
   * @apiGroup Users
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} id معرّف المستخدم.
   *
   * @apiSuccess {Object} user كائن المستخدم.
   *
   * @apiError (404) NotFound المستخدم غير موجود.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User ID',
  })
  @ApiOperation({ summary: 'Get a single user by ID' })
  @ApiResponse({ status: 200, description: 'User returned.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * @api {post} /users إنشاء مستخدم جديد
   * @apiName CreateUser
   * @apiGroup Users
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} email ايميل المستخدم.
   * @apiParam {String} name اسم المستخدم.
   * @apiParam {String} [role] دور المستخدم (اختياري).
   *
   * @apiSuccess {Object} user كائن المستخدم المنشأ.
   *
   * @apiError (400) BadRequest خطأ في حقول الإدخال.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createDto: CreateUserDto) {
    return this.usersService.create(createDto);
  }

  /**
   * @api {put} /users/:id تحديث بيانات مستخدم
   * @apiName UpdateUser
   * @apiGroup Users
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} id معرّف المستخدم.
   * @apiParam {String} [email] الايميل الجديد (اختياري).
   * @apiParam {String} [name] الاسم الجديد (اختياري).
   * @apiParam {String} [role] الدور الجديد (اختياري).
   *
   * @apiSuccess {Object} user كائن المستخدم المحدث.
   *
   * @apiError (404) NotFound المستخدم غير موجود.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User ID',
  })
  @ApiOperation({ summary: 'Update a user' })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateUserDto) {
    return this.usersService.update(id, updateDto);
  }

  /**
   * @api {delete} /users/:id حذف مستخدم
   * @apiName DeleteUser
   * @apiGroup Users
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   * @apiParam {String} id معرّف المستخدم.
   *
   * @apiSuccess {String} message رسالة حذف ناجح.
   *
   * @apiError (404) NotFound المستخدم غير موجود.
   * @apiError (401) Unauthorized توكن JWT غير صالح.
   */
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User ID',
  })
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
