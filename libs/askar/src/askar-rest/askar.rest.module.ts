import { Module, ValidationPipe } from "@nestjs/common";
import { AgentService } from "../askar/agent.service";
import { ConfigModule } from "@nestjs/config";
import { LedgersModule } from "@ocm-engine/ledgers";
import { APP_PIPE } from "@nestjs/core";
import { RestController } from "./rest.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    ConfigModule,
    LedgersModule,
    PassportModule,
    JwtModule.register({
      global: true,
    }),
  ],
  providers: [
    AgentService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        transform: true,
      }),
    },
  ],
  controllers: [RestController],
})
export class AskarRestModule {}
