import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt.strategy";
import { AccountService } from "./account.service";

@ApiTags("account")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("account")
export class AccountController {
  constructor(private readonly account: AccountService) {}

  @Get("profile")
  @ApiOperation({ summary: "Current user's profile, KYC and credit summary" })
  profile(@CurrentUser() user: AuthenticatedUser) {
    return this.account.getProfile(user.userId);
  }

  @Put("language")
  @ApiOperation({ summary: "Update preferred language" })
  setLanguage(@CurrentUser() user: AuthenticatedUser, @Body("language") language: string) {
    return this.account.setLanguage(user.userId, language);
  }
}
