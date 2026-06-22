import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

// Scaffolded module — see roadmap Phase 3 (IBAN repayment + cron via mock bank adapter).
@ApiTags("payments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("payments")
export class PaymentController {
  @Get()
  @ApiOperation({ summary: "List transactions (scaffolded)" })
  list() {
    return { module: "payment", status: "scaffolded" };
  }
}
