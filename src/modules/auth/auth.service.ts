// src/modules/auth/auth.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  Merchant,
  MerchantDocument,
} from '../merchants/schemas/merchant.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Merchant.name) private merchantModel: Model<MerchantDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, phone, storeName, whatsappNumber } =
      registerDto;

    // 1. التحقّق من عدم وجود User بنفس الايميل
    if (await this.userModel.findOne({ email })) {
      throw new BadRequestException('Email already in use');
    }

    // 2. تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. إنشاء مستند User جديد بدور MERCHANT
    const userDoc = await this.userModel.create({
      email,
      password: hashedPassword,
      name,
      phone,
      role: 'MERCHANT',
    });

    // 4. إنشاء مستند Merchant جديد مرتبط بـ userId
    const createdMerchant = await this.merchantModel.create({
      name: storeName,
      email,
      phone,
      whatsappNumber: whatsappNumber || phone,
      isActive: true,
      planName: 'free',
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يومًا
      autoReplyEnabled: true,
      userId: userDoc._id,
    });

    // 5. **تحديث حقل merchantId داخل سجلّ User نفسه** ليصبح لدينا علاقة مزدوجة السهم
    userDoc.merchantId = createdMerchant._id as Types.ObjectId; // ✅ حل خطأ Type 'unknown'
    await userDoc.save();

    // 6. إنشاء توقيع JWT وإرجاعه
    const payload = {
      userId: userDoc._id,
      role: userDoc.role,
      merchantId: createdMerchant._id, // ✅ نضيف معرف التاجر هنا
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        userId: userDoc._id,
        email: userDoc.email,
        role: userDoc.role,
        merchantId: createdMerchant._id,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email });
    if (!user) throw new BadRequestException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new BadRequestException('Invalid credentials');

    // تحميل التاجر المرتبط بهذا المستخدم
    const merchant = await this.merchantModel.findOne({ userId: user._id });

    const payload = {
      userId: user._id,
      role: user.role,
      merchantId: merchant?._id || null, // ✅ نضمن merchantId أو null
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        userId: user._id,
        email: user.email,
        role: user.role,
        merchantId: merchant?._id || null,
      },
    };
  }
}
