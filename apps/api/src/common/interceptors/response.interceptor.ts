import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { randomUUID } from "crypto";
import type { Request } from "express";

/**
 * Wraps every successful response in the standard envelope (spec §9.1):
 * { success: true, data, meta?, requestId, timestamp }
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const requestId = (req.headers["x-request-id"] as string) ?? randomUUID();

    return next.handle().pipe(
      map((payload) => {
        const isEnvelope =
          payload && typeof payload === "object" && "data" in payload && "meta" in payload;
        const data = isEnvelope ? (payload as { data: unknown }).data : payload;
        const meta = isEnvelope ? (payload as { meta: unknown }).meta : undefined;
        return {
          success: true,
          data,
          ...(meta ? { meta } : {}),
          requestId,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
