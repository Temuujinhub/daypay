import { Module } from "@nestjs/common";
import { LoanModule } from "../loan/loan.module";
import { LenderController } from "./lender.controller";
import { LenderPortalController } from "./lender-portal.controller";
import { LenderService } from "./lender.service";

@Module({
  imports: [LoanModule],
  controllers: [LenderController, LenderPortalController],
  providers: [LenderService],
})
export class LenderModule {}
