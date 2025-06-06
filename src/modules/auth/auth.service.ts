// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

interface JwtPayload {
  sub: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new UnauthorizedException('Email already in use');
    const user = new this.userModel({ email, password, name });
    await user.save();
    return { message: 'User registered successfully' };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne({ email }).lean();
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');
    const typedUser = user as UserDocument;
    const payload: JwtPayload = {
      sub: typedUser._id.toString(),
      role: typedUser.role,
    };
    return { accessToken: this.jwtService.sign(payload) };
  }
}
