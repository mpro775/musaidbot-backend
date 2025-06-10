// src/modules/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

import { UsersModule } from '../users/users.module';
import { MerchantsModule } from '../merchants/merchants.module';

import { User, UserSchema } from '../users/schemas/user.schema';
import { Merchant, MerchantSchema } from '../merchants/schemas/merchant.schema'; // ← استيراد الـ schema

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),

    // سجّل هنا كلا الـ schemas معاً
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Merchant.name, schema: MerchantSchema }, // ← إضافة هذا السطر
    ]),

    UsersModule,
    MerchantsModule, // لازمه ل AuthController الذي يستعمل MerchantsService
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
