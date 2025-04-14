import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  mixin,
  Type,
} from '@nestjs/common';

export function AdminGuard(isAdmin: boolean): Type<CanActivate> {
  @Injectable()
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user || user.isAdmin !== isAdmin) {
        throw new ForbiddenException('Access denied: Admins only');
      }

      return true;
    }
  }

  return mixin(RoleGuardMixin);
}
