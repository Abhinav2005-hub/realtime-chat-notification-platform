import Joi from "joi";

export const getMessageSchema = Joi.object({
  conversationId: Joi.string().uuid().required()
});
