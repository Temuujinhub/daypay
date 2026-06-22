import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { num } from "../../common/num";
import { ApplicationService } from "../loan/application.service";

@Injectable()
export class LenderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly applications: ApplicationService,
  ) {}

  listLenders() {
    return this.prisma.lender.findMany({
      where: { isActive: true },
      select: { id: true, name: true, nameShort: true, rating: true, logoUrl: true, cbuaeLicenceNo: true },
    });
  }

  async queue(lenderId: string) {
    const apps = await this.prisma.loanApplication.findMany({
      where: { lenderId, status: { in: ["submitted", "under_review", "documents_pending"] } },
      orderBy: { createdAt: "asc" },
      include: { user: true, loanProduct: true },
    });
    return apps.map((a) => ({
      id: a.id,
      applicationNumber: a.applicationNumber,
      userName: a.user.fullName ?? a.user.phoneNumber,
      productName: a.loanProduct.nameEn,
      requestedAmount: num(a.requestedAmount),
      requestedTerm: a.requestedTerm,
      creditScore: a.creditScoreAtApp,
      status: a.status,
      createdAt: a.createdAt,
    }));
  }

  async decide(lenderId: string, applicationId: string, approve: boolean, reason?: string) {
    const app = await this.prisma.loanApplication.findUnique({ where: { id: applicationId } });
    if (!app) throw new NotFoundException({ code: "NOT_FOUND", message: "Application not found" });
    if (app.lenderId !== lenderId) {
      throw new ForbiddenException({ code: "UNAUTHORIZED", message: "Not your application" });
    }
    return this.applications.decide(applicationId, approve, reason);
  }

  async portfolio(lenderId: string) {
    const [loansAgg, outstandingAgg, active, total] = await Promise.all([
      this.prisma.loan.aggregate({ where: { lenderId }, _sum: { principalAmount: true }, _count: { _all: true } }),
      this.prisma.loan.aggregate({ where: { lenderId, status: "active" }, _sum: { outstandingBalance: true } }),
      this.prisma.loan.count({ where: { lenderId, status: "active" } }),
      this.prisma.loanApplication.count({ where: { lenderId } }),
    ]);
    const loans = await this.prisma.loan.findMany({
      where: { lenderId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { user: true, application: { include: { loanProduct: true } } },
    });
    return {
      totalLoans: loansAgg._count._all,
      activeLoans: active,
      totalApplications: total,
      totalDisbursed: num(loansAgg._sum.principalAmount),
      totalOutstanding: num(outstandingAgg._sum.outstandingBalance),
      loans: loans.map((l) => ({
        id: l.id,
        loanNumber: l.loanNumber,
        userName: l.user.fullName ?? l.user.phoneNumber,
        productName: l.application.loanProduct.nameEn,
        principalAmount: num(l.principalAmount),
        outstandingBalance: num(l.outstandingBalance),
        status: l.status,
      })),
    };
  }
}
