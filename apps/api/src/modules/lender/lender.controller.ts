import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { LenderService } from "./lender.service";

@ApiTags("lenders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("lenders")
export class LenderController {
  constructor(private readonly lender: LenderService) {}

  @Get()
  @ApiOperation({ summary: "List active, licence-verified lenders" })
  list() {
    return this.lender.listLenders();
  }
}
