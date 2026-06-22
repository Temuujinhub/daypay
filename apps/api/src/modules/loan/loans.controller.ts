import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt.strategy";
import { LoansService } from "./loans.service";

@ApiTags("loans")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("loans")
export class LoansController {
  constructor(private readonly loans: LoansService) {}

  @Get()
  @ApiOperation({ summary: "List the user's loans" })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.loans.list(user.userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Loan detail with repayment schedule" })
  get(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.loans.get(user.userId, id);
  }

  @Get(":id/schedule")
  @ApiOperation({ summary: "Repayment schedule" })
  schedule(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.loans.getSchedule(user.userId, id);
  }

  @Post(":id/pay")
  @ApiOperation({ summary: "Pay the next installment (mock IBAN debit)" })
  pay(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.loans.pay(user.userId, id);
  }
}
