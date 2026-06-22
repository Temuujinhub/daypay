import { Module } from "@nestjs/common";
import { LenderController } from "./lender.controller";

@Module({ controllers: [LenderController] })
export class LenderModule {}
