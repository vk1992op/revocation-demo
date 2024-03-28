import { registerAs } from "@nestjs/config";
import * as process from "process";
import { ILedgers } from "../interfaces/ledgers.config.interface";

export const ledgersConfig = registerAs(
  "ledgers",
  (): ILedgers => ({
    ledgers: process.env["LEDGERS"]!.split(","),
    idUnionApiKey: process.env["IDUNION_KEY"]!,
    idUnionApiBasicUser: process.env["IDUNION_BASIC_USER"]!,
    idUnionApiBasicPass: process.env["IDUNION_BASIC_PASS"]!,
  }),
);
