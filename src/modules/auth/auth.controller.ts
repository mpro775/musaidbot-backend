import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @api {post} /auth/register تسجيل مستخدم جديد
   * @apiName Register
   * @apiGroup Authentication
   *
   * @apiParam {String} email ايميل المستخدم (يجب أن يكون فريدًا).
   * @apiParam {String} password كلمة المرور (على الأقل 6 أحرف).
   * @apiParam {String} name اسم المستخدم (على الأقل 3 أحرف).
   *
   * @apiSuccess {String} message رسالة نجاح التسجيل.
   *
   * @apiError (400) BadRequest خطأ في حقول الإدخال (Validation).
   * @apiError (401) Unauthorized الايميل مستخدم مسبقًا.
   */
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * @api {post} /auth/login تسجيل الدخول والحصول على توكن JWT
   * @apiName Login
   * @apiGroup Authentication
   *
   * @apiParam {String} email ايميل المستخدم.
   * @apiParam {String} password كلمة المرور.
   *
   * @apiSuccess {String} accessToken التوكن المستخدم لتأمين النقاط المحمية.
   *
   * @apiError (401) Unauthorized بيانات الاعتماد غير صحيحة.
   */
  @ApiOperation({ summary: 'Login and return JWT access token' })
  @ApiResponse({
    status: 200,
    description: 'Login successful, token returned.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized: Invalid credentials.',
  })
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * @api {post} /auth/profile جلب بيانات المستخدم المحميّة
   * @apiName GetProfile
   * @apiGroup Authentication
   *
   * @apiHeader {String} Authorization توكن JWT (Bearer).
   *
   * @apiSuccess {Object} user كائن يحتوي على بيانات المستخدم (userId و role).
   *
   * @apiError (401) Unauthorized يجب توفير توكن JWT صالح.
   */
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile (protected)' })
  @ApiResponse({ status: 200, description: 'User profile returned.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}
