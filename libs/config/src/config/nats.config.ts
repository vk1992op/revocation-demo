import { registerAs } from "@nestjs/config";
import * as process from "process";
import { IConfNats } from "../interfaces/nats.config.interface";

export const natsConfig = registerAs(
  "nats",
  (): IConfNats => ({
    servers:
      (process.env["NATS_SERVERS"] &&
        process.env["NATS_SERVERS"]!.split(",")) ||
      [],
    streamName: process.env["NATS_STREAM_NAME"]! || "default-stream",
    subjects:
      (process.env["NATS_SUBJECTS"] &&
        process.env["NATS_SUBJECTS"]!.split(",")) ||
      [],
  }),
);
