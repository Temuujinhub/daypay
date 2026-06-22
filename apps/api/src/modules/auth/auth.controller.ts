import { Body, Controller, Delete, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  RefreshRequest,
  RegisterRequest,
  ResendOtpRequest,
  VerifyOtpRequest,
} from "@daypay/contracts";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { SandboxLimitGuard } from "./sandbox-limit.guard";
import type { AuthenticatedUser } from "./jwt.strategy";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  @UseGuards(SandboxLimitGuard)
  @ApiOperation({ summary: "Start OTP registration (UAE phone number)" })
  register(@Body(new ZodValidationPipe(RegisterRequest)) dto: RegisterRequest) {
    return this.auth.register(dto);
  }

  @Post("otp/verify")
  @ApiOperation({ summary: "Verify OTP and receive JWT tokens" })
  verify(@Body(new ZodValidationPipe(VerifyOtpRequest)) dto: VerifyOtpRequest) {
    return this.auth.verifyOtp(dto);
  }

  @Post("otp/resend")
  @ApiOperation({ summary: "Resend OTP" })
  resend(@Body(new ZodValidationPipe(ResendOtpRequest)) dto: ResendOtpRequest) {
    return this.auth.resend(dto);
  }

  @Post("refresh")
  @ApiOperation({ summary: "Exchange a refresh token for new tokens" })
  refresh(@Body(new ZodValidationPipe(RefreshRequest)) dto: RefreshRequest) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Delete("logout")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Log out (stateless — client discards tokens)" })
  logout() {
    return { loggedOut: true };
  }

  @Get("session")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Return the authenticated user's id and role" })
  session(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }
}
