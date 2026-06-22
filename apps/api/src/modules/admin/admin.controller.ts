import { Body, Controller, Get, Param, Put, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { AdminService } from "./admin.service";

@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("super_admin", "mlro")
@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("overview")
  @ApiOperation({ summary: "Dashboard metrics" })
  overview() {
    return this.admin.overview();
  }

  @Get("users")
  @ApiOperation({ summary: "List/search users" })
  users(@Query("q") q?: string) {
    return this.admin.listUsers(q);
  }

  @Get("users/:id")
  @ApiOperation({ summary: "User detail (KYC, loans, applications)" })
  user(@Param("id") id: string) {
    return this.admin.getUser(id);
  }

  @Put("users/:id/suspend")
  @ApiOperation({ summary: "Suspend / reactivate a user" })
  suspend(@Param("id") id: string, @Body("suspend") suspend: boolean) {
    return this.admin.suspendUser(id, suspend ?? true);
  }

  @Get("applications")
  @ApiOperation({ summary: "List loan applications" })
  applications(@Query("status") status?: string) {
    return this.admin.listApplications(status);
  }

  @Get("loans")
  @ApiOperation({ summary: "List loans" })
  loans(@Query("status") status?: string) {
    return this.admin.listLoans(status);
  }

  @Get("kyc-queue")
  @ApiOperation({ summary: "Pending KYC review queue" })
  kycQueue() {
    return this.admin.kycQueue();
  }

  @Put("kyc/:id/review")
  @ApiOperation({ summary: "Approve or reject a user's KYC" })
  reviewKyc(
    @Param("id") id: string,
    @Body("approve") approve: boolean,
    @Body("notes") notes?: string,
  ) {
    return this.admin.reviewKyc(id, approve, notes);
  }

  @Get("reports/sandbox")
  @ApiOperation({ summary: "DFSA ITL sandbox report" })
  sandboxReport() {
    return this.admin.sandboxReport();
  }
}
