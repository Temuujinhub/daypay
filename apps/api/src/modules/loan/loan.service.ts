import { Injectable } from "@nestjs/common";
import { calculateLoan, LoanCalculatorRequest, LoanCalculatorResult } from "@daypay/contracts";
import { PrismaService } from "../../common/prisma/prisma.service";

@Injectable()
export class LoanService {
  constructor(private readonly prisma: PrismaService) {}

  calculate(input: LoanCalculatorRequest): LoanCalculatorResult {
    return calculateLoan(input);
  }

  listProducts() {
    return this.prisma.loanProduct.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
    });
  }
}
