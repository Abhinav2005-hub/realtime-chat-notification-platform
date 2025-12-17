import joi from "joi";

 export const getMessageSchema = joi.object({
    conversationId: joistring().uuid().required()
 });