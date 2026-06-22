import { Injectable, NotFoundException } from "@nestjs/common";
import { ProfileResponse } from "@daypay/contracts";
import { PrismaService } from "../../common/prisma/prisma.service";
import { num } from "../../common/num";

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<ProfileResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException({ code: "NOT_FOUND", message: "User not found" });

    const activeLoans = await this.prisma.loan.findMany({
      where: { userId, status: "active" },
      select: { outstandingBalance: true },
    });
    const totalOutstanding = activeLoans.reduce((s, l) => s + num(l.outstandingBalance), 0);

    const lastTxn = await this.prisma.transaction.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    const firstName = (user.fullName ?? "").trim().split(/\s+/)[0] || "there";

    return {
      id: user.id,
      fullName: user.fullName,
      firstName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      kycStatus: user.kycStatus,
      kycVerified: user.kycStatus === "verified",
      creditScore: user.creditScore,
      creditLimit: num(user.creditLimit),
      availableCredit: num(user.availableCredit),
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      preferredLanguage: user.preferredLanguage,
      lastTransaction: lastTxn
        ? {
            label: lastTxn.type === "repayment" ? "Payment" : lastTxn.type,
            amount: lastTxn.direction === "debit" ? -num(lastTxn.amount) : num(lastTxn.amount),
          }
        : null,
    };
  }

  async setLanguage(userId: string, language: string): Promise<{ ok: true }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { preferredLanguage: language as never },
    });
    return { ok: true };
  }
}
