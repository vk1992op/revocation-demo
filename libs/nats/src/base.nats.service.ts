import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  connect,
  DiscardPolicy,
  JetStreamClient,
  JetStreamManager,
  JSONCodec,
  NatsConnection,
  NatsError,
  RetentionPolicy,
  StorageType,
  StreamConfig,
} from "nats";
import asyncRetry from "async-retry";
import { IConfAgent, IConfNats } from "@ocm-engine/config";

@Injectable()
export class NatsBaseService {
  protected config: IConfNats;
  protected jsonCodec = JSONCodec();
  protected client: NatsConnection;
  protected jsClient: JetStreamClient;
  protected jsm: JetStreamManager;
  protected readonly logger: Logger = new Logger(NatsBaseService.name);
  protected streamConfig: StreamConfig;

  constructor(private configService: ConfigService) {
    const agentConfig = this.configService.get<IConfAgent>("agent");
    if (agentConfig?.agentIsRest) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.config = configService.get<IConfNats>("nats")!;

    //TODO: What part should be configured by env vars ?
    this.streamConfig = {
      first_seq: 0,
      allow_direct: false,
      allow_rollup_hdrs: false,
      deny_delete: false,
      deny_purge: false,
      discard: DiscardPolicy.Old,
      discard_new_per_subject: false,
      duplicate_window: 0,
      max_bytes: -1,
      max_msg_size: -1,
      max_msgs: -1,
      mirror_direct: false,
      num_replicas: 0,
      name: this.config.streamName,
      max_consumers: 1,
      subjects: this.config.subjects,
      retention: RetentionPolicy.Workqueue,
      sealed: false,
      storage: StorageType.File,
      max_msgs_per_subject: 10,
      max_age: 86400000000000,
    };
    this.connectToNats();
  }

  private async connectToNats() {
    await asyncRetry(
      async () => {
        this.client = await connect({ servers: this.config.servers });
        this.jsClient = this.client.jetstream();
        this.jsm = await this.client.jetstreamManager();

        await this.registerStream(this.streamConfig);
      },
      {
        retries: 5,
        onRetry: (error) => {
          this.logger.log(JSON.stringify(error, null, 2));
          this.logger.error(
            `Failed to connect to NATS, retrying...${error.message}`,
          );
        },
      },
    );

    this.logger.log("Connected to Nats");
  }

  disconnect = () => {
    return this.client.close();
  };

  private registerStream = async (sconfig: StreamConfig) => {
    try {
      return await this.jsm.streams.add(sconfig);
    } catch (e) {
      this.logger.log(JSON.stringify(e, null, 2));

      if (
        (e instanceof NatsError && e.api_error?.err_code === 10058) ||
        (e instanceof NatsError && e.api_error?.err_code === 10065)
      ) {
        this.logger.log(`Trying to update ${sconfig.name} stream`);
        return await this.jsm.streams.update(sconfig.name, sconfig);
      }

      throw new Error(`RegisterStream failed.`);
    }
  };
}
