import { Module, Global } from "@nestjs/common";
import { AskarService } from "./askar.service";
import { AgentService } from "./agent.service";
import { ConfigModule } from "@nestjs/config";
import { LedgersModule } from "@ocm-engine/ledgers";
import { AgentEventListenerService } from "./agent-event-listener.service";

@Global()
@Module({
  imports: [ConfigModule, LedgersModule],
  providers: [
    AgentService,
    AskarService,
    AgentEventListenerService,
  ],
  exports: [AgentService, AskarService],
})
export class AskarModule {}
