import { Module } from "@nestjs/common";
import { LoanController } from "./loan.controller";
import { LoanService } from "./loan.service";
import { LoansController } from "./loans.controller";
import { LoansService } from "./loans.service";
import { ApplicationsController } from "./applications.controller";
import { ApplicationService } from "./application.service";

@Module({
  controllers: [LoanController, LoansController, ApplicationsController],
  providers: [LoanService, LoansService, ApplicationService],
  exports: [ApplicationService],
})
export class LoanModule {}
