import { Injectable, NotFoundException } from "@nestjs/common";
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

  async getProduct(code: string) {
    const product = await this.prisma.loanProduct.findUnique({ where: { productCode: code } });
    if (!product) throw new NotFoundException({ code: "NOT_FOUND", message: "Product not found" });
    return product;
  }
}
