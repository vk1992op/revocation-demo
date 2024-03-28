import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AskarRestModule } from "./askar-rest/askar.rest.module";
import { AskarModule } from "./askar/askar.module";
import * as process from "process";

@Module({})
export class AskarDynamicModule {
  static forRootAsync(): DynamicModule {
    const isRest = process.env["AGENT_IS_REST"] === "true";

    const module = AskarRestModule;

    return {
      module: AskarDynamicModule,
      imports: [ConfigModule, AskarModule, module],
      providers: [module],
    };
  }
}
