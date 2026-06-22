import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { KycStatusResponse, KycSubmitRequest } from "@daypay/contracts";
import { PrismaService } from "../../common/prisma/prisma.service";
import { num } from "../../common/num";

const SANDBOX_CREDIT_SCORE = 720;
const SANDBOX_CREDIT_LIMIT = 35000;

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Mock KYC: in INTEGRATIONS_MODE=mock we auto-verify the user and assign a
   * sandbox credit score/limit. Real UAEID/AECB/biometric adapters slot in here.
   */
  async submit(userId: string, dto: KycSubmitRequest): Promise<KycStatusResponse> {
    await this.prisma.kycProfile.upsert({
      where: { userId },
      update: {
        emiratesIdNumber: dto.emiratesIdNumber,
        fullNameEn: dto.fullName,
        biometricMatchScore: 95,
        amlScreeningResult: "clear",
        amlScreeningDate: new Date(),
      },
      create: {
        userId,
        emiratesIdNumber: dto.emiratesIdNumber,
        fullNameEn: dto.fullName,
        biometricMatchScore: 95,
        amlScreeningResult: "clear",
        amlScreeningDate: new Date(),
      },
    });

    const loans = await this.prisma.loan.findMany({
      where: { userId, status: "active" },
      select: { outstandingBalance: true },
    });
    const outstanding = loans.reduce((s, l) => s + num(l.outstandingBalance), 0);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: "verified",
        fullName: dto.fullName ?? undefined,
        creditScore: SANDBOX_CREDIT_SCORE,
        creditLimit: SANDBOX_CREDIT_LIMIT,
        availableCredit: Math.max(0, SANDBOX_CREDIT_LIMIT - outstanding),
      },
    });

    return {
      status: user.kycStatus,
      creditScore: user.creditScore,
      creditLimit: num(user.creditLimit),
      biometricMatchScore: 95,
    };
  }

  async getStatus(userId: string): Promise<KycStatusResponse> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const profile = await this.prisma.kycProfile.findUnique({ where: { userId } });
    return {
      status: user.kycStatus,
      creditScore: user.creditScore,
      creditLimit: num(user.creditLimit),
      biometricMatchScore: profile ? num(profile.biometricMatchScore) : null,
    };
  }
}
