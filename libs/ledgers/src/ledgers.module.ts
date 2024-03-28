import { Module } from "@nestjs/common";
import { LedgersService } from "./ledgers.service";
import { BcovrinTestProvider } from "./bcovrin-test/bcovrin-test.provider";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    LedgersService,
    BcovrinTestProvider,
  ],
  exports: [LedgersService],
})
export class LedgersModule {}
