import { BadRequestException, Injectable } from "@nestjs/common";
import { MailService } from "src/mail/mail.service";
import { PrismaService } from "src/prisma.service";
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordResetService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Email not found');

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await this.prisma.passwordReset.upsert({
      where: { email },
      update: { token, expiresAt },
      create: { email, token, expiresAt },
    });

    await this.mailService.sendResetPasswordEmail(email, token);
    return { message: 'Password reset email sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.passwordReset.findUnique({ where: { token } });

    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { email: record.email },
      data: { password: hashed },
    });

    await this.prisma.passwordReset.delete({ where: { token } });

    return { message: 'Password reset successfully' };
  }

}