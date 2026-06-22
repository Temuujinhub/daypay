import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { LoanCalculatorRequest } from "@daypay/contracts";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { LoanService } from "./loan.service";

@ApiTags("loan-products")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("loan-products")
export class LoanController {
  constructor(private readonly loan: LoanService) {}

  @Get()
  @ApiOperation({ summary: "List active loan products" })
  list() {
    return this.loan.listProducts();
  }

  @Post("calculate")
  @ApiOperation({ summary: "Calculate monthly payment / total interest" })
  calculate(@Body(new ZodValidationPipe(LoanCalculatorRequest)) dto: LoanCalculatorRequest) {
    return this.loan.calculate(dto);
  }

  @Get(":code")
  @ApiOperation({ summary: "Loan product detail" })
  get(@Param("code") code: string) {
    return this.loan.getProduct(code);
  }
}
