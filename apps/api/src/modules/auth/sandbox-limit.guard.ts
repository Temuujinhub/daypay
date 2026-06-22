import { CanActivate, ForbiddenException, Injectable } from "@nestjs/common";
import { ErrorCode } from "@daypay/contracts";
import { PrismaService } from "../../common/prisma/prisma.service";

/**
 * Enforces the DFSA ITL sandbox user cap (spec §10.2).
 * Reads `sandbox_mode` and `max_users` from the sandbox_config table.
 */
@Injectable()
export class SandboxLimitGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(): Promise<boolean> {
    const mode = await this.prisma.sandboxConfig.findUnique({ where: { key: "sandbox_mode" } });
    if (mode?.value !== "true") {
      return true;
    }

    const maxRow = await this.prisma.sandboxConfig.findUnique({ where: { key: "max_users" } });
    const maxUsers = Number.parseInt(maxRow?.value ?? "100", 10);

    const current = await this.prisma.user.count({
      where: { isSandboxUser: true, isActive: true },
    });

    if (current >= maxUsers) {
      throw new ForbiddenException({
        code: ErrorCode.SANDBOX_USER_LIMIT,
        message: "Sandbox user limit reached. Registration is temporarily closed.",
        details: { current, maxUsers },
      });
    }
    return true;
  }
}
