import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './roles.guard';


export function AdminOnly() {
    
  return applyDecorators(
    UseGuards(JwtAuthGuard, AdminGuard(true)),
    
  );
}
