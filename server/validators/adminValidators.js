import joi from "joi";

export const blockUserSchema = joi.object({
    userId: joi.string().uuid().required()
});

export const deleteMessageSchema = joi.object({
    messageId: joi.string().uuid().required()
});