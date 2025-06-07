import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('المصادقة')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'تسجيل مستخدم جديد' })
  @ApiBody({
    type: RegisterDto,
    description: 'بيانات التسجيل: البريد الإلكتروني، كلمة المرور، الاسم',
  })
  @ApiCreatedResponse({ description: 'تم تسجيل المستخدم بنجاح' })
  @ApiBadRequestResponse({
    description: 'طلب غير صالح: بيانات مفقودة أو تنسيق خاطئ',
  })
  @ApiUnauthorizedResponse({ description: 'البريد الإلكتروني مستخدم مسبقًا' })
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'تسجيل الدخول وإرجاع توكن JWT' })
  @ApiBody({
    type: LoginDto,
    description: 'بيانات الاعتماد: البريد الإلكتروني وكلمة المرور',
  })
  @ApiOkResponse({
    description: 'تم تسجيل الدخول بنجاح وتم إرجاع التوكن',
    schema: { example: { accessToken: 'jwt-token-here' } },
  })
  @ApiUnauthorizedResponse({ description: 'بيانات الاعتماد غير صحيحة' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'جلب بيانات المستخدم الحالي (محمي)' })
  @ApiOkResponse({
    description: 'تم إرجاع ملف المستخدم',
    schema: {
      example: {
        userId: '123',
        email: 'user@example.com',
        name: 'اسم المستخدم',
        role: 'user',
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'توكن JWT مفقود أو غير صالح' })
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}

/**
 * النواقص:
 * - يمكن إضافة @ApiForbiddenResponse إذا كان هناك تمييز في الصلاحيات.
 * - توثيق الحقول الدقيقة في RegisterDto وLoginDto (الحد الأدنى للطول، القواعد).
 * - توضيح حالة إعادة إرسال رابط التفعيل أو إعادة تعيين كلمة المرور.
 */
