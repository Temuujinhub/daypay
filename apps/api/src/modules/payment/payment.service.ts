import { Injectable } from "@nestjs/common";
import { TransactionDto } from "@daypay/contracts";
import { PrismaService } from "../../common/prisma/prisma.service";
import { num } from "../../common/num";

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<TransactionDto[]> {
    const rows = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return rows.map((t) => ({
      id: t.id,
      referenceNumber: t.referenceNumber,
      type: t.type,
      amount: num(t.amount),
      currency: t.currency,
      direction: t.direction,
      status: t.status,
      description: t.type === "repayment" ? "Loan repayment" : t.type === "disbursement" ? "Loan disbursed" : null,
      createdAt: t.createdAt.toISOString(),
    }));
  }
}
