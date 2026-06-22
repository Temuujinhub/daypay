import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateApplicationRequest } from "@daypay/contracts";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/jwt.strategy";
import { ApplicationService } from "./application.service";

@ApiTags("applications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("applications")
export class ApplicationsController {
  constructor(private readonly applications: ApplicationService) {}

  @Post()
  @ApiOperation({ summary: "Apply for a loan (runs eligibility + sandbox decision)" })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body(new ZodValidationPipe(CreateApplicationRequest)) dto: CreateApplicationRequest,
  ) {
    return this.applications.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: "List the user's applications" })
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.applications.list(user.userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Application detail" })
  get(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.applications.get(user.userId, id);
  }
}
