import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import {
  ApplicationResponse,
  CreateApplicationRequest,
  EligibilityResult,
} from "@daypay/contracts";
import { PrismaService } from "../../common/prisma/prisma.service";
import { num, genRef } from "../../common/num";
import { buildSchedule } from "../../common/amortization";

@Injectable()
export class ApplicationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateApplicationRequest): Promise<ApplicationResponse> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const product = await this.prisma.loanProduct.findUnique({
      where: { productCode: dto.productCode },
    });
    if (!product) throw new NotFoundException({ code: "NOT_FOUND", message: "Product not found" });

    const lenderProduct = await this.prisma.lenderProduct.findFirst({
      where: {
        loanProductId: product.id,
        isActive: true,
        ...(dto.lenderId ? { lenderId: dto.lenderId } : {}),
      },
      orderBy: { offeredApr: "asc" },
    });
    if (!lenderProduct) {
      throw new BadRequestException({ code: "VALIDATION_FAILED", message: "No lender available for this product" });
    }

    const reasons: string[] = [];
    if (user.kycStatus !== "verified") reasons.push("KYC is not verified");
    if ((user.creditScore ?? 0) < product.minCreditScore)
      reasons.push(`Credit score below ${product.minCreditScore}`);
    if (dto.amount < num(product.minAmount) || dto.amount > num(product.maxAmount))
      reasons.push(`Amount must be between ${num(product.minAmount)} and ${num(product.maxAmount)}`);
    if (!product.availableTerms.includes(dto.termMonths))
      reasons.push(`Term must be one of ${product.availableTerms.join(", ")} months`);
    if (dto.amount > num(user.availableCredit)) reasons.push("Amount exceeds your available credit");

    const eligibility: EligibilityResult = {
      passed: reasons.length === 0,
      creditScore: user.creditScore,
      reasons,
    };

    const application = await this.prisma.loanApplication.create({
      data: {
        applicationNumber: genRef("APP"),
        userId,
        lenderProductId: lenderProduct.id,
        loanProductId: product.id,
        lenderId: lenderProduct.lenderId,
        requestedAmount: dto.amount,
        requestedTerm: dto.termMonths,
        purpose: dto.purpose,
        status: eligibility.passed ? "under_review" : "rejected",
        eligibilityPassed: eligibility.passed,
        creditScoreAtApp: user.creditScore,
        rejectionReason: eligibility.passed ? null : reasons.join("; "),
        submittedAt: new Date(),
        sandboxFlag: true,
      },
    });

    // Sandbox: auto-approve eligible applications instantly.
    if (eligibility.passed) {
      await this.disburse(application.id);
    }
    return this.toResponse(application.id);
  }

  /** Lender/admin decision on an under-review application. */
  async decide(applicationId: string, approve: boolean, reason?: string): Promise<ApplicationResponse> {
    const app = await this.prisma.loanApplication.findUnique({ where: { id: applicationId } });
    if (!app) throw new NotFoundException({ code: "NOT_FOUND", message: "Application not found" });
    if (!["submitted", "under_review", "documents_pending"].includes(app.status)) {
      throw new BadRequestException({ code: "VALIDATION_FAILED", message: "Application is not pending a decision" });
    }
    if (approve) {
      await this.disburse(applicationId);
    } else {
      await this.prisma.loanApplication.update({
        where: { id: applicationId },
        data: { status: "rejected", rejectionReason: reason ?? "Declined by lender", decidedAt: new Date() },
      });
    }
    return this.toResponse(applicationId);
  }

  /** Approve → create loan, amortized schedule, disbursement txn + notification. */
  private async disburse(applicationId: string): Promise<void> {
    const app = await this.prisma.loanApplication.findUniqueOrThrow({
      where: { id: applicationId },
      include: { lenderProduct: true },
    });
    const amount = num(app.requestedAmount);
    const apr = num(app.lenderProduct.offeredApr);
    const term = app.requestedTerm;
    const start = new Date();
    const { monthlyPayment, installments } = buildSchedule(amount, apr, term, start);

    await this.prisma.$transaction(async (tx) => {
      const loan = await tx.loan.create({
        data: {
          loanNumber: genRef("LN"),
          applicationId: app.id,
          userId: app.userId,
          lenderId: app.lenderId,
          principalAmount: amount,
          apr,
          termMonths: term,
          monthlyPayment,
          outstandingBalance: amount,
          paymentsRemaining: term,
          nextPaymentDate: installments[0]!.dueDate,
          nextPaymentAmount: installments[0]!.totalAmount,
          status: "active",
          disbursedAt: new Date(),
          sandboxFlag: true,
        },
      });
      await tx.repaymentSchedule.createMany({
        data: installments.map((i) => ({
          loanId: loan.id,
          installmentNumber: i.installmentNumber,
          dueDate: i.dueDate,
          principalComponent: i.principalComponent,
          interestComponent: i.interestComponent,
          totalAmount: i.totalAmount,
        })),
      });
      await tx.transaction.create({
        data: {
          referenceNumber: genRef("TXN"),
          userId: app.userId,
          loanId: loan.id,
          type: "disbursement",
          amount,
          direction: "credit",
          status: "completed",
          paymentMethod: "iban_transfer",
          processedAt: new Date(),
        },
      });
      await tx.notification.create({
        data: {
          userId: app.userId,
          type: "loan_approved",
          channel: "push",
          title: "Your loan was approved!",
          body: `Your loan of AED ${amount.toLocaleString()} has been disbursed.`,
          sentAt: new Date(),
        },
      });
      await tx.loanApplication.update({
        where: { id: app.id },
        data: {
          status: "disbursed",
          approvedAmount: amount,
          approvedApr: apr,
          approvedTerm: term,
          decidedAt: new Date(),
        },
      });
      await tx.user.update({
        where: { id: app.userId },
        data: { availableCredit: { decrement: amount } },
      });
    });
  }

  async list(userId: string): Promise<ApplicationResponse[]> {
    const apps = await this.prisma.loanApplication.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    return Promise.all(apps.map((a) => this.toResponse(a.id)));
  }

  async get(userId: string, id: string): Promise<ApplicationResponse> {
    const app = await this.prisma.loanApplication.findFirst({ where: { id, userId }, select: { id: true } });
    if (!app) throw new NotFoundException({ code: "NOT_FOUND", message: "Application not found" });
    return this.toResponse(app.id);
  }

  async toResponse(applicationId: string): Promise<ApplicationResponse> {
    const app = await this.prisma.loanApplication.findUniqueOrThrow({
      where: { id: applicationId },
      include: { loanProduct: true, lender: true, loan: true },
    });
    return {
      id: app.id,
      applicationNumber: app.applicationNumber,
      status: app.status,
      productName: app.loanProduct.nameEn,
      lenderName: app.lender.name,
      requestedAmount: num(app.requestedAmount),
      requestedTerm: app.requestedTerm,
      approvedAmount: app.approvedAmount ? num(app.approvedAmount) : null,
      approvedApr: app.approvedApr ? num(app.approvedApr) : null,
      eligibility: {
        passed: app.eligibilityPassed ?? false,
        creditScore: app.creditScoreAtApp,
        reasons: app.rejectionReason ? app.rejectionReason.split("; ") : [],
      },
      loanId: app.loan?.id ?? null,
      createdAt: app.createdAt.toISOString(),
    };
  }
}
