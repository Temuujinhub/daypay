import { Body, Controller, ForbiddenException, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ErrorCode } from "@daypay/contracts";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt.strategy";
import { LenderService } from "./lender.service";

/** Lender-admin portal: scoped to the signed-in lender via JWT `lenderId`. */
@ApiTags("lender-portal")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("lender_admin")
@Controller("lender")
export class LenderPortalController {
  constructor(private readonly lender: LenderService) {}

  private lenderIdOf(user: AuthenticatedUser): string {
    if (!user.lenderId) {
      throw new ForbiddenException({
        code: ErrorCode.UNAUTHORIZED,
        message: "Your account is not linked to a lender.",
      });
    }
    return user.lenderId;
  }

  @Get("queue")
  @ApiOperation({ summary: "Applications awaiting this lender's decision" })
  queue(@CurrentUser() user: AuthenticatedUser) {
    return this.lender.queue(this.lenderIdOf(user));
  }

  @Get("portfolio")
  @ApiOperation({ summary: "This lender's loan portfolio and totals" })
  portfolio(@CurrentUser() user: AuthenticatedUser) {
    return this.lender.portfolio(this.lenderIdOf(user));
  }

  @Post("applications/:id/decision")
  @ApiOperation({ summary: "Approve or decline an application (auto-disburses on approve)" })
  decide(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body("approve") approve: boolean,
    @Body("reason") reason?: string,
  ) {
    return this.lender.decide(this.lenderIdOf(user), id, approve ?? false, reason);
  }
}
