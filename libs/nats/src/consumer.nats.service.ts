import { Injectable } from "@nestjs/common";
import {
  AckPolicy,
  ConsumerConfig,
  DeliverPolicy,
  NatsError,
  ReplayPolicy,
} from "nats";
import { NatsBaseService } from "./base.nats.service";
import { ConfigService } from "@nestjs/config";
import { CloudEventDto, OcmError } from "@ocm-engine/dtos";
import { SimpleMutex } from "nats/lib/nats-base-client/util";
import { IConfAgent } from "@ocm-engine/config";

@Injectable()
export class ConsumerService extends NatsBaseService {
  //eslint-disable-next-line
  private readonly agentConfig: IConfAgent;
  constructor(configService: ConfigService) {
    super(configService);

    //TODO: no like ! move config, interfaces to seperate lib
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.agentConfig = configService.get<IConfAgent>("agent")!;
  }

  private registerConsumer = (stream: string) => {
    const consumerConfig: ConsumerConfig = {
      max_deliver: 5,
      ack_wait: 60 * 1000_000_000, // increase wait time to 1 minute
      name: this.agentConfig.agentConsumerName,
      ack_policy: AckPolicy.Explicit,
      deliver_policy: DeliverPolicy.All,
      replay_policy: ReplayPolicy.Original,
    };

    try {
      this.jsm.consumers.add(stream, consumerConfig);

      return this.jsClient.consumers.get(stream, consumerConfig.name);
    } catch (error) {
      if (error instanceof NatsError && error.code === "409") {
        this.logger.log("Consumer already exists");
        return this.jsClient.consumers.get(stream, consumerConfig.name);
      }

      throw new Error(
        `register consumer fail ${JSON.stringify(error, null, 2)}`,
      );
    }
  };

  async subscribe<T>(
    handler: (event: CloudEventDto<T>) => Promise<void>,
  ): Promise<void> {
    const consumer = await this.registerConsumer(this.streamConfig.name);

    const messages = await consumer.consume({
      max_messages: this.agentConfig.agentConsumerMaxMessages,
    });

    for await (const message of messages) {
      const event = this.jsonCodec.decode(message.data) as CloudEventDto<T>;

      this.logger.log("event received, processing...");
      this.logger.debug(JSON.stringify(event, null, 2));

      // if this is "await" it will create a head-of-line blocking
      // i.e. no other message will be consumed

      // if I remove "await" this may lead to large number
      // of async operations which may exceed the limits of the runtime
      // we will need to introduce rate limiter and etc.

      // https://github.com/nats-io/nats.deno/blob/main/examples/jetstream/07_consume_jobs.ts
      // Can the agent handle the concurency of working with two things for example - creating schema and creating cred def ??
      // I guess load tests need to be done (I'm pretty sure the wallet cant handle such thing, as the ledgers are extremely slow)

      const rl = new SimpleMutex(this.agentConfig.agentConsumerRateLimit);
      rl.lock();

      handler(event)
        .then(() => message.ack())
        .catch((e) => {
          if (e instanceof OcmError) {
            this.logger.log(
              `OCM error occurred during event consumption: ${e.message}`,
            );
            return message.ack();
          }
          if (e instanceof Error) {
            this.logger.log(
              `Could not handle consuming event with reason, ${e.message}`,
            );
          }
          //TODO: we should implement dead letter queue
          return message.nak();
        })
        .finally(() => rl.unlock());
    }
  }
}
