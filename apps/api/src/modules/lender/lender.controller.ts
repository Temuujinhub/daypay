import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { PrismaService } from "../../common/prisma/prisma.service";

@ApiTags("lenders")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("lenders")
export class LenderController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "List active, licence-verified lenders" })
  list() {
    return this.prisma.lender.findMany({
      where: { isActive: true },
      select: { id: true, name: true, nameShort: true, rating: true, logoUrl: true },
    });
  }
}
