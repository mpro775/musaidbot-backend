import {
  Controller,
  Post,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OnboardingDto } from './dto/onboarding.dto';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestWithUser } from '../../common/interfaces/request-with-user.interface';

import { MerchantsService } from '../merchants/merchants.service';
import { UsersService } from '../users/users.service';

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
  constructor(
    private readonly authService: AuthService,
    private readonly merchantService: MerchantsService,
    private readonly userService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'تسجيل مستخدم جديد (الحقول: اسم، إيميل، كلمة المرور)',
  })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({ description: 'تم التسجيل بنجاح' })
  @ApiBadRequestResponse({ description: 'خطأ في البيانات أو الإيميل موجود' })
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'تسجيل الدخول وإرجاع توكن JWT' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'تم تسجيل الدخول بنجاح' })
  @ApiUnauthorizedResponse({ description: 'بيانات الاعتماد غير صحيحة' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Put('onboarding')
  @ApiOperation({ summary: 'استكمال بيانات المتجر بعد التسجيل' })
  @ApiBody({ type: OnboardingDto })
  @ApiOkResponse({
    description: 'تم تحديث بيانات المتجر وإتمام الـ onboarding',
  })
  @ApiUnauthorizedResponse({ description: 'توكن غير صالح' })
  async completeOnboarding(
    @Req() { user }: RequestWithUser,
    @Body() dto: OnboardingDto,
  ) {
    if (!user.merchantId) {
      throw new BadRequestException('merchantId missing from token');
    }

    // 1. تحديث بيانات التاجر
    await this.merchantService.update(
      user.merchantId, // الآن من النوع string
      {
        name: dto.name, // هنا
        logoUrl: dto.logoUrl,
        phone: dto.phone,
        whatsappNumber: dto.whatsappNumber,
      },
    );

    // 2. تأكد من وجود user.id أيضاً
    if (!user.id) {
      throw new BadRequestException('userId missing from token');
    }

    // 3. تعيين firstLogin = false
    await this.userService.setFirstLoginFalse(user.id);

    // 4. إعادة بيانات المستخدم المحدثة
    return this.userService.findOne(user.id);
  }
}
