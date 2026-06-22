import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt.strategy";
import { PaymentService } from "./payment.service";

@ApiTags("payments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("payments")
export class PaymentController {
  constructor(private readonly payments: PaymentService) {}

  @Get()
  @ApiOperation({ summary: "List the user's transactions" })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.payments.list(user.userId);
  }
}
