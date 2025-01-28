import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { RegisterDTO, LoginDTO, AuthResponse } from '../types/auth.types';

const prisma = new PrismaClient();

export class AuthService {
  private generateToken(userId: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const options: SignOptions = {
      expiresIn: 7 * 24 * 60 * 60 // 7 days in seconds
    };

    return jwt.sign({ id: userId }, secret, options);
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true
      }
    });

    const token = this.generateToken(user.id);

    return { user, token };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email
      },
      token
    };
  }
} 