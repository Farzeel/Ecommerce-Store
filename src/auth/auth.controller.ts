
import { PasswordResetService } from './password-reset/password-reset.service'
import { Body, Controller, Get, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { VerificationService } from './verification/verification.service';
import { ForgetPassword } from './dto/forgetPassword.dto';

@Controller('auth')
export class AuthController {
   
    constructor(private readonly authService:AuthService,private readonly VerificationService: VerificationService,private readonly PasswordResetService: PasswordResetService ) {}

    // @Post('register')
    // async register(@Body() body:RegisterDto ){
    //     return await this.authService.register(body)
    // }
    @Post('login')
    async login(@Body() body: LoginDto) {
      return this.authService.login(body.email, body.password);
    }
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Req() req) {
      // `req.user` is populated by JwtStrategy
      return req.user;
    }
  @Post('request-verification')
async requestEmailVerification(@Body() dto: RegisterDto) {
  return this.VerificationService.requestVerification(dto.name, dto.email, dto.password);
}
@Patch('verify')
async verifyToken(@Query('token') token: string) {
  return this.VerificationService.verifyToken(token);
}

@Patch('request-password-reset')
async requestReset(@Body('email') email: string) {
  return this.PasswordResetService.requestPasswordReset(email);
}

@Patch('reset-password')
async resetPassword(@Query('token') token: string, @Body() dto: ForgetPassword) {
  return this.PasswordResetService.resetPassword(token, dto.password);
}
}
