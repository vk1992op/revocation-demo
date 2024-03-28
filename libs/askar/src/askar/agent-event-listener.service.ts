import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { AskarService } from "./askar.service";
import {
  BasicMessageEventTypes,
  TrustPingEventTypes,
  BasicMessageRole,
  BasicMessageStateChangedEvent,
  ConnectionEventTypes,
  ConnectionStateChangedEvent,
  ProofEventTypes,
  ProofStateChangedEvent,
  TrustPingResponseReceivedEvent,
} from "@credo-ts/core";
import { MessageRecordDto, makeEvent, MESSAGE_MAKE } from "@ocm-engine/dtos";
import { IConfAgent } from "@ocm-engine/config";
import { ConfigService } from "@nestjs/config";
import {
  webHookHandler,
} from "../agent.utils";

@Injectable()
export class AgentEventListenerService implements OnModuleInit {
  private agentConfig: IConfAgent | undefined;
  private readonly logger: Logger = new Logger(AgentEventListenerService.name);

  constructor(
    private readonly askar: AskarService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    this.logger.debug("Agent is listening for AFJ events");
    this.agentConfig = this.configService.get<IConfAgent>("agent");

    if (this.agentConfig?.agentIsSVDX && this.agentConfig?.agentIsRest) {
      this.askar.agent.events.on(
        ConnectionEventTypes.ConnectionStateChanged,
        async (ev: ConnectionStateChangedEvent) => {
          this.logger.log("connection state event received");
          this.logger.debug(JSON.stringify(ev, null, 2));
        },
      );

      this.askar.agent.events.on(
        ProofEventTypes.ProofStateChanged,
        async (ev: ProofStateChangedEvent) => {
          this.logger.log("proof state event received");
          this.logger.debug(JSON.stringify(ev, null, 2));
        },
      );
    }

    if (this.agentConfig?.agentIsRest) {
      this.askar.agent.events.on(
        TrustPingEventTypes.TrustPingResponseReceivedEvent,
        async (ev: TrustPingResponseReceivedEvent) => {
          if (!this.agentConfig?.agentWebHook) {
            throw new Error("Agent config is missing agentWebHook");
          }

          return webHookHandler(this.agentConfig?.agentWebHook, "ping", {
            thid: ev.payload.message.threadId,
            connectionId: ev.payload.connectionRecord.id,
          });
        },
      );
    }

    this.askar.agent.events.on(
      BasicMessageEventTypes.BasicMessageStateChanged,
      async (ev: BasicMessageStateChangedEvent) => {
        if (ev.payload.basicMessageRecord.role === BasicMessageRole.Receiver) {
          this.logger.debug(JSON.stringify(ev, null, 2));

          const messageRecord = ev.payload.basicMessageRecord;

          const connectionInfo = await this.askar.agent.connections.findById(
            messageRecord.connectionId,
          );
          const label = connectionInfo?.theirLabel || "";
          const dto = new MessageRecordDto();

          dto.id = messageRecord.id;
          dto.createdAt = messageRecord.createdAt;
          dto.updatedAt = messageRecord.updatedAt;
          dto.connectionId = messageRecord.connectionId;
          dto.role = messageRecord.role;
          dto.content = messageRecord.content;
          dto.sentTime = messageRecord.sentTime;
          dto.from =
            messageRecord.role === BasicMessageRole.Receiver ? label : "";
          dto.to = messageRecord.role === BasicMessageRole.Sender ? label : "";

          if (this.agentConfig?.agentIsRest) {
            this.logger.debug(
              "agent is configured as rest, webhook still not implemented",
            );

            return;
          }

          const event = makeEvent({
            data: dto,
            type: MESSAGE_MAKE,
            source: "agent-basic-message-afj",
          });

          this.logger.debug("Sending message event to gateway");
        }
      },
    );
  }
}
