import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { KycSubmitRequest } from "@daypay/contracts";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt.strategy";
import { KycService } from "./kyc.service";

@ApiTags("kyc")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("kyc")
export class KycController {
  constructor(private readonly kyc: KycService) {}

  @Post("submit")
  @ApiOperation({ summary: "Submit Emirates ID + selfie for KYC (mock auto-verify)" })
  submit(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(KycSubmitRequest)) dto: KycSubmitRequest,
  ) {
    return this.kyc.submit(user.userId, dto);
  }

  @Get("status")
  @ApiOperation({ summary: "Get KYC status + credit score" })
  status(@CurrentUser() user: AuthenticatedUser) {
    return this.kyc.getStatus(user.userId);
  }
}
