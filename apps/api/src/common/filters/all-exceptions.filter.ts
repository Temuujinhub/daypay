import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import type { Request, Response } from "express";
import { ErrorCode } from "@daypay/contracts";

/**
 * Renders all errors in the standard failure envelope (spec §9.1):
 * { success: false, error: { code, message, details? }, requestId, timestamp }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const requestId = (req.headers["x-request-id"] as string) ?? randomUUID();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ErrorCode.VALIDATION_FAILED;
    let message = "Internal server error";
    let details: Record<string, unknown> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === "string") {
        message = body;
        code = this.defaultCodeFor(status);
      } else if (body && typeof body === "object") {
        const b = body as Record<string, unknown>;
        code = (b.code as string) ?? this.defaultCodeFor(status);
        message = (b.message as string) ?? exception.message;
        details = b.details as Record<string, unknown> | undefined;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.stack);
    }

    res.status(status).json({
      success: false,
      error: { code, message, ...(details ? { details } : {}) },
      requestId,
      timestamp: new Date().toISOString(),
    });
  }

  private defaultCodeFor(status: number): string {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return ErrorCode.UNAUTHORIZED;
      case HttpStatus.NOT_FOUND:
        return ErrorCode.NOT_FOUND;
      case HttpStatus.BAD_REQUEST:
        return ErrorCode.VALIDATION_FAILED;
      default:
        return "INTERNAL_ERROR";
    }
  }
}
