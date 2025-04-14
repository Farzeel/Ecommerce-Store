import { Injectable, BadRequestException } from '@nestjs/common';

import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class VerificationService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async requestVerification(name: string, email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new BadRequestException('Email already in use');

    const existingRequest = await this.prisma.verification.findUnique({ where: { email } });
    if (existingRequest) {
      await this.prisma.verification.delete({ where: { email } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
 console.log("expiresAt",expiresAt)
    await this.prisma.verification.create({
      data: {
        name,
        email,
        password: hashedPassword,
        token,
        expiresAt,
      },
    });

    await this.mailService.sendVerificationEmail(email, token);

    return { message: 'Verification email sent. Please check your inbox.' };
  }

  async verifyToken(token: string) {
    const record = await this.prisma.verification.findUnique({ where: { token } });

    if (!record) throw new BadRequestException('Invalid token');
    if (record.expiresAt < new Date()) throw new BadRequestException('Token expired');

    const user = await this.prisma.user.create({
      data: {
        name: record.name,
        email: record.email,
        password: record.password,
      },
    });

    await this.prisma.verification.delete({ where: { token } });

    return { message: 'Email verified. You can now login.', user };
  }
}
