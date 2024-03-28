import { Injectable } from "@nestjs/common";
import { PubAck, JetStreamPublishOptions } from "nats";
import { NatsBaseService } from "./base.nats.service";
import { ConfigService } from "@nestjs/config";
import { CloudEventDto } from "@ocm-engine/dtos";

@Injectable()
export class ProducerService extends NatsBaseService {
  constructor(configService: ConfigService) {
    super(configService);
  }

  async publish<T>(
    subject: string,
    event: CloudEventDto<T>,
    opts?: JetStreamPublishOptions,
  ): Promise<PubAck> {
    const payload = this.jsonCodec.encode(event);
    return this.jsClient.publish(subject, payload, opts);
  }
}
