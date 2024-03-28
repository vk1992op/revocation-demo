import Joi from "joi";

export const ledgersSchema = Joi.object({
  LEDGERS: Joi.string().required(),
  IDUNION_KEY: Joi.string(),
});
