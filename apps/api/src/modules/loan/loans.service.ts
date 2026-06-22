import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { LoanDetail, LoanSummary, RepaymentInstallment } from "@daypay/contracts";
import { PrismaService } from "../../common/prisma/prisma.service";
import { num, genRef } from "../../common/num";

type LoanWithRelations = Awaited<ReturnType<LoansService["loadLoan"]>>;

@Injectable()
export class LoansService {
  constructor(private readonly prisma: PrismaService) {}

  private loadLoan(userId: string, loanId: string) {
    return this.prisma.loan.findFirst({
      where: { id: loanId, userId },
      include: { lender: true, application: { include: { loanProduct: true } } },
    });
  }

  private toSummary(loan: NonNullable<LoanWithRelations>): LoanSummary {
    return {
      id: loan.id,
      loanNumber: loan.loanNumber,
      productName: loan.application.loanProduct.nameEn,
      lenderName: loan.lender.name,
      principalAmount: num(loan.principalAmount),
      apr: num(loan.apr),
      termMonths: loan.termMonths,
      monthlyPayment: num(loan.monthlyPayment),
      outstandingBalance: num(loan.outstandingBalance),
      nextPaymentDate: loan.nextPaymentDate ? loan.nextPaymentDate.toISOString().slice(0, 10) : null,
      nextPaymentAmount: loan.nextPaymentAmount ? num(loan.nextPaymentAmount) : null,
      paymentsMade: loan.paymentsMade,
      paymentsRemaining: loan.paymentsRemaining,
      status: loan.status,
    };
  }

  async list(userId: string): Promise<LoanSummary[]> {
    const loans = await this.prisma.loan.findMany({
      where: { userId },
      include: { lender: true, application: { include: { loanProduct: true } } },
      orderBy: { createdAt: "desc" },
    });
    return loans.map((l) => this.toSummary(l));
  }

  async get(userId: string, loanId: string): Promise<LoanDetail> {
    const loan = await this.loadLoan(userId, loanId);
    if (!loan) throw new NotFoundException({ code: "NOT_FOUND", message: "Loan not found" });
    const schedule = await this.getSchedule(userId, loanId);
    return { ...this.toSummary(loan), schedule };
  }

  async getSchedule(userId: string, loanId: string): Promise<RepaymentInstallment[]> {
    const loan = await this.prisma.loan.findFirst({ where: { id: loanId, userId }, select: { id: true } });
    if (!loan) throw new NotFoundException({ code: "NOT_FOUND", message: "Loan not found" });
    const rows = await this.prisma.repaymentSchedule.findMany({
      where: { loanId },
      orderBy: { installmentNumber: "asc" },
    });
    return rows.map((r) => ({
      installmentNumber: r.installmentNumber,
      dueDate: r.dueDate.toISOString().slice(0, 10),
      principalComponent: num(r.principalComponent),
      interestComponent: num(r.interestComponent),
      totalAmount: num(r.totalAmount),
      paidAmount: num(r.paidAmount),
      status: r.status,
    }));
  }

  /** Pay the next pending installment (mock IBAN debit). */
  async pay(userId: string, loanId: string): Promise<LoanSummary> {
    const loan = await this.loadLoan(userId, loanId);
    if (!loan) throw new NotFoundException({ code: "NOT_FOUND", message: "Loan not found" });
    if (loan.status !== "active") {
      throw new BadRequestException({ code: "VALIDATION_FAILED", message: "Loan is not active" });
    }

    const next = await this.prisma.repaymentSchedule.findFirst({
      where: { loanId, status: "pending" },
      orderBy: { installmentNumber: "asc" },
    });
    if (!next) throw new BadRequestException({ code: "VALIDATION_FAILED", message: "Nothing due" });

    const principal = num(next.principalComponent);
    const total = num(next.totalAmount);

    await this.prisma.$transaction(async (tx) => {
      await tx.repaymentSchedule.update({
        where: { id: next.id },
        data: { status: "paid", paidAmount: total, paidAt: new Date() },
      });
      await tx.transaction.create({
        data: {
          referenceNumber: genRef("TXN"),
          userId,
          loanId,
          scheduleId: next.id,
          type: "repayment",
          amount: total,
          direction: "debit",
          status: "completed",
          paymentMethod: "iban_debit",
          processedAt: new Date(),
        },
      });

      const upcoming = await tx.repaymentSchedule.findFirst({
        where: { loanId, status: "pending" },
        orderBy: { installmentNumber: "asc" },
      });
      const paymentsMade = loan.paymentsMade + 1;
      const paymentsRemaining = Math.max(0, loan.paymentsRemaining - 1);
      const outstanding = Math.max(0, num(loan.outstandingBalance) - principal);

      await tx.loan.update({
        where: { id: loanId },
        data: {
          paymentsMade,
          paymentsRemaining,
          outstandingBalance: outstanding,
          totalPaid: num(loan.totalPaid) + total,
          totalInterestPaid: num(loan.totalInterestPaid) + num(next.interestComponent),
          nextPaymentDate: upcoming ? upcoming.dueDate : null,
          nextPaymentAmount: upcoming ? num(upcoming.totalAmount) : null,
          status: upcoming ? "active" : "settled",
        },
      });
      await tx.user.update({
        where: { id: userId },
        data: { availableCredit: { increment: principal } },
      });
    });

    const updated = await this.loadLoan(userId, loanId);
    return this.toSummary(updated!);
  }
}
