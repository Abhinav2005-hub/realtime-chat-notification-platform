import Joi from "joi";

export const getMessageSchema = Joi.object({
  conversationId: Joi.string().uuid().required()
});

export const sendMessageSchema = Joi.object({
  conversationId: Joi.string().uuid().required(),
  content: Joi.string().min(1).required(),
  replyToId: Joi.string().uuid().optional()
});

export const markSeenSchema = Joi.object({
  conversationId: Joi.string().uuid().required()
});

export const editMessageSchema = Joi.object({
  newContent: Joi.string().min(1).required()
});
