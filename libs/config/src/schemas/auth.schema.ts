import Joi from "joi";

export const authSchema = Joi.object({
  AUTH_BASIC_USER: Joi.string(),
  AUTH_BASIC_PASS: Joi.string(),
  AUTH_JWT_PUBLIC_KEY: Joi.string(),
});
