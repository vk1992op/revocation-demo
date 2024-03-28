import { Module } from "@nestjs/common";

import { AskarDynamicModule } from "@ocm-engine/askar";
import { ConfigModule } from "@nestjs/config";
import {
  agentConfig,
  agentSchema,
  authSchema,
  ledgersConfig,
  ledgersSchema,
  natsConfig,
  natsSchema,
} from "@ocm-engine/config";
import Joi from "joi";

const validationSchema = Joi.object({
  agent: agentSchema,
  auth: authSchema,
  ledgers: ledgersSchema,
  nats: natsSchema,
});

@Module({
  imports: [
    AskarDynamicModule.forRootAsync(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [agentConfig, ledgersConfig, natsConfig],
      validationSchema,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
