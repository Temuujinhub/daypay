import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  AuthTokens,
  ErrorCode,
  RegisterRequest,
  ResendOtpRequest,
  VerifyOtpRequest,
} from "@daypay/contracts";
import { PrismaService } from "../../common/prisma/prisma.service";
import type { JwtPayload } from "./jwt.strategy";

interface OtpEntry {
  code: string;
  expiresAt: number;
  attempts: number;
}

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes (spec §4.1.1)
const MAX_ATTEMPTS = 3;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // In-memory OTP store for the mock SMS adapter. Replace with Redis when
  // a real SMS gateway is wired in (INTEGRATIONS_MODE=live).
  private readonly otpStore = new Map<string, OtpEntry>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private get isMock(): boolean {
    return this.config.get<string>("INTEGRATIONS_MODE", "mock") === "mock";
  }

  private generateAndStoreOtp(phoneNumber: string): string {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.otpStore.set(phoneNumber, { code, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });
    // Mock SMS gateway: log instead of sending.
    this.logger.log(`[mock-sms] OTP for ${phoneNumber}: ${code}`);
    return code;
  }

  async register(dto: RegisterRequest): Promise<{ sent: true; devCode?: string }> {
    await this.prisma.user.upsert({
      where: { phoneNumber: dto.phoneNumber },
      update: { preferredLanguage: dto.preferredLanguage },
      create: {
        phoneNumber: dto.phoneNumber,
        preferredLanguage: dto.preferredLanguage,
        isSandboxUser: this.config.get<string>("SANDBOX_MODE") === "true",
      },
    });

    const code = this.generateAndStoreOtp(dto.phoneNumber);
    return this.isMock ? { sent: true, devCode: code } : { sent: true };
  }

  async resend(dto: ResendOtpRequest): Promise<{ sent: true; devCode?: string }> {
    const code = this.generateAndStoreOtp(dto.phoneNumber);
    return this.isMock ? { sent: true, devCode: code } : { sent: true };
  }

  async verifyOtp(dto: VerifyOtpRequest): Promise<AuthTokens> {
    const entry = this.otpStore.get(dto.phoneNumber);
    if (!entry || entry.expiresAt < Date.now()) {
      throw new UnauthorizedException({
        code: ErrorCode.OTP_INVALID,
        message: "OTP is invalid or has expired.",
      });
    }
    if (entry.attempts >= MAX_ATTEMPTS) {
      throw new UnauthorizedException({
        code: ErrorCode.OTP_RATE_LIMITED,
        message: "Too many attempts. Please request a new OTP.",
      });
    }
    if (entry.code !== dto.code) {
      entry.attempts += 1;
      throw new UnauthorizedException({
        code: ErrorCode.OTP_INVALID,
        message: "Incorrect OTP code.",
      });
    }

    this.otpStore.delete(dto.phoneNumber);
    const user = await this.prisma.user.update({
      where: { phoneNumber: dto.phoneNumber },
      data: { phoneVerified: true, lastLoginAt: new Date() },
    });

    return this.issueTokens({ sub: user.id, role: "user" });
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
      });
      return this.issueTokens({ sub: payload.sub, role: payload.role });
    } catch {
      throw new UnauthorizedException({
        code: ErrorCode.UNAUTHORIZED,
        message: "Invalid refresh token.",
      });
    }
  }

  private async issueTokens(payload: JwtPayload): Promise<AuthTokens> {
    const accessTtl = this.config.get<string>("JWT_ACCESS_TTL", "15m");
    const refreshTtl = this.config.get<string>("JWT_REFRESH_TTL", "30d");

    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      expiresIn: accessTtl,
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
      expiresIn: refreshTtl,
    });

    return { accessToken, refreshToken, expiresIn: 15 * 60 };
  }
}
