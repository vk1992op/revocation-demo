import Joi from "joi";

export const agentSchema = Joi.object({
  AGENT_PEER_URL: Joi.string().required(),
  AGENT_NAME: Joi.string().required(),
  AGENT_KEY: Joi.string().required(),
  AGENT_DID_SEED: Joi.string().required(),
  AGENT_DB_HOST: Joi.string().required(),
  AGENT_DB_USER: Joi.string().required(),
  AGENT_DB_PASS: Joi.string().required(),
  AGENT_CONSUMER_NAME: Joi.string(),
  AGENT_IS_REST: Joi.string().optional(),
  AGENT_MAX_MESSAGES: Joi.string().required(),
  AGENT_RETE_LIMIT: Joi.string().required(),
  AGENT_PORT: Joi.string().required(),
  AGENT_IS_SVDX: Joi.string().optional(),
  AGENT_SVDX_WEBHOOK_URL: Joi.string().optional(),
});
