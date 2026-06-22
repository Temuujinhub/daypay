import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

// Scaffolded module — see roadmap Phase 3 (push/SMS/email via mock adapters).
@ApiTags("notifications")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("notifications")
export class NotificationController {
  @Get()
  @ApiOperation({ summary: "List notifications (scaffolded)" })
  list() {
    return { module: "notification", status: "scaffolded" };
  }
}
