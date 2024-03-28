import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ProducerService } from "./producer.nats.service";
import { ConsumerService } from "./consumer.nats.service";

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [ProducerService, ConsumerService],
  exports: [ProducerService, ConsumerService],
})
export class NatsModule {}
