import { PipeTransform, BadRequestException } from "@nestjs/common";
import { ZodError, ZodSchema } from "zod";
import { ErrorCode } from "@daypay/contracts";

/**
 * Validates request payloads against a shared Zod schema from @daypay/contracts.
 * Usage: `@Body(new ZodValidationPipe(RegisterRequest)) dto: RegisterRequest`
 */
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    try {
      return this.schema.parse(value);
    } catch (err) {
      if (err instanceof ZodError) {
        throw new BadRequestException({
          code: ErrorCode.VALIDATION_FAILED,
          message: "Request validation failed.",
          details: { issues: err.issues },
        });
      }
      throw err;
    }
  }
}
