import Joi from "joi";

export const natsSchema = Joi.object({
  NATS_SERVERS: Joi.string(),
  NATS_STREAM_NAME: Joi.string(),
  NATS_SUBJECTS: Joi.string(),
});
