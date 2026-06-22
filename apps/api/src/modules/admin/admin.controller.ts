import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

// Scaffolded module — see roadmap Phase 4 (user mgmt, KYC queue, DFSA reports).
@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("admin")
export class AdminController {
  @Get("ping")
  @ApiOperation({ summary: "Admin module health (scaffolded)" })
  ping() {
    return { module: "admin", status: "scaffolded" };
  }
}
