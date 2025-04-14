import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

import { AdminService } from "./admin.service";
import { AdminOnly } from "src/auth/roles.decorator";

@Controller('admin')

export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @AdminOnly()
  async getStats() {
    return this.adminService.getDashboardStats();
  }
}