import joi from "joi";

export const saveTokenSchema = joi.object({
    fcmToken: joi.string().required()
});