import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../common/prisma/prisma.service";
import { num } from "../../common/num";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [totalUsers, kycVerified, activeLoans, applications, disbursedAgg, outstandingAgg] =
      await Promise.all([
        this.prisma.user.count({ where: { role: "user" } }),
        this.prisma.user.count({ where: { kycStatus: "verified", role: "user" } }),
        this.prisma.loan.count({ where: { status: "active" } }),
        this.prisma.loanApplication.groupBy({ by: ["status"], _count: { _all: true } }),
        this.prisma.loan.aggregate({ _sum: { principalAmount: true }, _count: { _all: true } }),
        this.prisma.loan.aggregate({ where: { status: "active" }, _sum: { outstandingBalance: true } }),
      ]);

    const applicationsByStatus: Record<string, number> = {};
    for (const row of applications) applicationsByStatus[row.status] = row._count._all;

    return {
      totalUsers,
      kycVerified,
      activeLoans,
      totalLoans: disbursedAgg._count._all,
      totalDisbursed: num(disbursedAgg._sum.principalAmount),
      totalOutstanding: num(outstandingAgg._sum.outstandingBalance),
      applicationsByStatus,
    };
  }

  async listUsers(q?: string) {
    const users = await this.prisma.user.findMany({
      where: q
        ? {
            OR: [
              { phoneNumber: { contains: q, mode: "insensitive" } },
              { fullName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        email: true,
        kycStatus: true,
        creditScore: true,
        creditLimit: true,
        availableCredit: true,
        isActive: true,
        role: true,
        createdAt: true,
      },
    });
    return users.map((u) => ({
      ...u,
      creditLimit: num(u.creditLimit),
      availableCredit: num(u.availableCredit),
    }));
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        kycProfile: true,
        loans: { include: { lender: true, application: { include: { loanProduct: true } } } },
        applications: { include: { loanProduct: true, lender: true }, orderBy: { createdAt: "desc" } },
      },
    });
    if (!user) throw new NotFoundException({ code: "NOT_FOUND", message: "User not found" });
    return {
      id: user.id,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      email: user.email,
      kycStatus: user.kycStatus,
      creditScore: user.creditScore,
      creditLimit: num(user.creditLimit),
      availableCredit: num(user.availableCredit),
      isActive: user.isActive,
      role: user.role,
      createdAt: user.createdAt,
      kyc: user.kycProfile,
      loans: user.loans.map((l) => ({
        id: l.id,
        loanNumber: l.loanNumber,
        productName: l.application.loanProduct.nameEn,
        lenderName: l.lender.name,
        principalAmount: num(l.principalAmount),
        outstandingBalance: num(l.outstandingBalance),
        status: l.status,
      })),
      applications: user.applications.map((a) => ({
        id: a.id,
        applicationNumber: a.applicationNumber,
        productName: a.loanProduct.nameEn,
        status: a.status,
        requestedAmount: num(a.requestedAmount),
        createdAt: a.createdAt,
      })),
    };
  }

  async suspendUser(id: string, suspend: boolean) {
    await this.prisma.user.update({ where: { id }, data: { isActive: !suspend } });
    return { id, isActive: !suspend };
  }

  async listApplications(status?: string) {
    const apps = await this.prisma.loanApplication.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: true, loanProduct: true, lender: true },
    });
    return apps.map((a) => ({
      id: a.id,
      applicationNumber: a.applicationNumber,
      userName: a.user.fullName ?? a.user.phoneNumber,
      productName: a.loanProduct.nameEn,
      lenderName: a.lender.name,
      requestedAmount: num(a.requestedAmount),
      requestedTerm: a.requestedTerm,
      status: a.status,
      createdAt: a.createdAt,
    }));
  }

  async listLoans(status?: string) {
    const loans = await this.prisma.loan.findMany({
      where: status ? { status: status as never } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: true, lender: true, application: { include: { loanProduct: true } } },
    });
    return loans.map((l) => ({
      id: l.id,
      loanNumber: l.loanNumber,
      userName: l.user.fullName ?? l.user.phoneNumber,
      productName: l.application.loanProduct.nameEn,
      lenderName: l.lender.name,
      principalAmount: num(l.principalAmount),
      outstandingBalance: num(l.outstandingBalance),
      apr: num(l.apr),
      paymentsMade: l.paymentsMade,
      termMonths: l.termMonths,
      status: l.status,
    }));
  }

  async kycQueue() {
    const users = await this.prisma.user.findMany({
      where: { kycStatus: { in: ["pending", "in_review"] }, role: "user" },
      include: { kycProfile: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return users.map((u) => ({
      id: u.id,
      phoneNumber: u.phoneNumber,
      fullName: u.fullName,
      kycStatus: u.kycStatus,
      emiratesId: u.kycProfile?.emiratesIdNumber ?? null,
      biometricMatchScore: u.kycProfile ? num(u.kycProfile.biometricMatchScore) : null,
    }));
  }

  async reviewKyc(userId: string, approve: boolean, notes?: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: approve ? "verified" : "rejected",
        ...(approve ? { creditScore: 700, creditLimit: 30000, availableCredit: 30000 } : {}),
      },
    });
    await this.prisma.kycProfile.updateMany({
      where: { userId },
      data: { reviewedAt: new Date(), reviewNotes: notes },
    });
    return { id: userId, kycStatus: user.kycStatus };
  }

  /** DFSA ITL Regulatory Test Plan metrics (spec §10.4). */
  async sandboxReport() {
    const [totalUsers, verified, apps, approved, loansAgg, overdue] = await Promise.all([
      this.prisma.user.count({ where: { role: "user" } }),
      this.prisma.user.count({ where: { kycStatus: "verified", role: "user" } }),
      this.prisma.loanApplication.count(),
      this.prisma.loanApplication.count({ where: { status: { in: ["approved", "disbursed"] } } }),
      this.prisma.loan.aggregate({ _sum: { principalAmount: true }, _avg: { principalAmount: true }, _count: { _all: true } }),
      this.prisma.repaymentSchedule.count({ where: { status: "overdue" } }),
    ]);
    return {
      newUsersRegistered: totalUsers,
      kycApprovalRate: totalUsers ? Math.round((verified / totalUsers) * 100) : 0,
      loanApplicationsCount: apps,
      loansApprovedCount: approved,
      averageLoanAmount: Math.round(num(loansAgg._avg.principalAmount)),
      totalPortfolio: num(loansAgg._sum.principalAmount),
      nplCount: overdue,
      maxSandboxUsers: 100,
    };
  }
}
