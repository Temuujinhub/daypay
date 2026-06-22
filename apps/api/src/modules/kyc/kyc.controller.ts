import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt.strategy";

// Scaffolded module — see roadmap Phase 1 (Emirates ID OCR + biometrics via mock adapter).
@ApiTags("kyc")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("kyc")
export class KycController {
  @Get("status")
  @ApiOperation({ summary: "Get KYC status (scaffolded)" })
  status(@CurrentUser() user: AuthenticatedUser) {
    return { module: "kyc", status: "scaffolded", userId: user.userId };
  }
}
