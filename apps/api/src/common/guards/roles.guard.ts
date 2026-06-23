import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ErrorCode, UserRole } from "@daypay/contracts";
import { ROLES_KEY } from "../decorators/roles.decorator";
import type { AuthenticatedUser } from "../../modules/auth/jwt.strategy";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest().user as AuthenticatedUser | undefined;
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException({
        code: ErrorCode.UNAUTHORIZED,
        message: "You do not have permission to access this resource.",
      });
    }
    return true;
  }
}
