import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // REGISTER
  async register(userData: any) {

    // Hash password
    const hashedPassword =
      await bcrypt.hash(
        userData.password,
        10,
      );

    // Save user
    const user =
      await this.usersService.create({
        ...userData,
        password: hashedPassword,
      });

    return {
      message: 'User Registered Successfully',
      user,
    };
  }

  // LOGIN
  async login(
    email: string,
    password: string,
  ) {

    // Find user
    const user =
      await this.usersService.findByEmail(
        email,
      );

    if (!user) {
      throw new UnauthorizedException(
        'Invalid Credentials',
      );
    }

    // Compare password
    const isMatch =
      await bcrypt.compare(
        password,
        String(user.password),
      );

    if (!isMatch) {
      throw new UnauthorizedException(
        'Invalid Credentials',
      );
    }

    // Generate JWT token
    const token =
      this.jwtService.sign({
        id: String(user._id),
        email: user.email,
        role: user.role,
      });

    return {

      message: 'Login Successful',

      token,

      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}