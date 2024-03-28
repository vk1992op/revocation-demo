import { registerAs } from "@nestjs/config";
import * as process from "process";
import { IConfAgent } from "../interfaces/agent.config.interface";
import { LogLevel } from "@credo-ts/core";

export const agentConfig = registerAs(
  "agent",
  (): IConfAgent => ({
    agentPeerPort: parseInt(process.env["AGENT_PEER_PORT"]!) || 8001,
    agentPeerAddress: process.env["AGENT_PEER_URL"]!,
    agentName: process.env["AGENT_NAME"]!,
    agentKey: process.env["AGENT_KEY"]!,
    agentDidSeed: process.env["AGENT_DID_SEED"]!,
    agentDbHost: process.env["AGENT_DB_HOST"]!,
    agentDbUser: process.env["AGENT_DB_USER"]!,
    agentDbPass: process.env["AGENT_DB_PASS"]!,
    agentIsRest: process.env["AGENT_IS_REST"] === "true",
    agentConsumerName: process.env["AGENT_CONSUMER_NAME"]!,
    agentConsumerMaxMessages:
      parseInt(process.env["AGENT_MAX_MESSAGES"]!) || 10,
    agentConsumerRateLimit: parseInt(process.env["AGENT_RETE_LIMIT"]!) || 5,
    agentPort: parseInt(process.env["AGENT_PORT"]!),
    agentOobGoals:
      typeof process.env["AGENT_OOB_GOALS"] !== "undefined"
        ? process.env["AGENT_OOB_GOALS"]!.split(",")
        : [],
    agentIsSVDX: process.env["AGENT_IS_SVDX"] === "true",
    agentSVDXWebHook: process.env["AGENT_SVDX_WEBHOOK_URL"]!,
    agentSVDXBasicUser: process.env["AGENT_SVDX_BASIC_USER"]!,
    agentSVDXBasicPass: process.env["AGENT_SVDX_BASIC_PASS"]!,

    agentAuthBasicEnabled:
      !!process.env["AUTH_BASIC_USER"] && !!process.env["AUTH_BASIC_PASS"],
    agentAuthBasicUser: process.env["AUTH_BASIC_USER"]!,
    agentAuthBasicPass: process.env["AUTH_BASIC_PASS"]!,
    agentAuthJwtEnabled: !!process.env["AUTH_JWT_PUBLIC_KEY"],
    agentAuthJwtPublicKey: process.env["AUTH_JWT_PUBLIC_KEY"]!,
    logLevel: parseInt(process.env["LOG_LEVEL"]!) ?? LogLevel.error,
    agentWebHook: process.env["AGENT_WEBHOOK_URL"]!,
    agentOobUrl: process.env["AGENT_OOB_URL"] || undefined,
    tailsServerBaseUrl: process.env["TAILS_SERVER_BASE_URL"]!,
    s3AccessKey: process.env["TAILS_SERVER_KEY"]!,
    s3Secret: process.env["TAILS_SERVER_SECRET"]!,
    tailsServerBucketName: process.env["TAILS_SERVER_BUCKET_NAME"]!,
    revocationListSize: Number(process.env["REVOCATION_LIST_SIZE"]!),
  }),
);
