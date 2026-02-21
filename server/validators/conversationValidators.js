import Joi from "joi";

/**
 * Create 1-to-1 conversation
 * body: { userId }
 */
export const createConversationSchema = Joi.object({
  userId: Joi.string().uuid().required()
});

/**
 * Create group conversation
 * body: { name, members }
 */
export const createGroupSchema = Joi.object({
  name: Joi.string().min(3).required(),
  memberIds: Joi.array()
    .items(Joi.string().uuid())
    .min(1)
    .required()
});
