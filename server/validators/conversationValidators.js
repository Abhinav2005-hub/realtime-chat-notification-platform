import joi from "joi";

export const createGroupSchema = joi.object({
    name: joi.string().min(3).required(),
    memberIds: joi.array().items(joi.string().uuid()).min(2).required()
});