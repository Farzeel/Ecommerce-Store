
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { MailService } from 'src/mail/mail.service';
import { VerificationService } from './verification/verification.service';
import { PasswordResetService } from './password-reset/password-reset.service';


@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    PrismaModule, 
    JwtModule.register({secret:process.env.JWT_SECRET , signOptions:{expiresIn:"7d"}}) ,    
  ],
  providers: [AuthService,JwtStrategy,MailService,VerificationService,PasswordResetService],
  controllers: [AuthController],
  exports: [JwtModule,PassportModule],
})
export class AuthModule {}
