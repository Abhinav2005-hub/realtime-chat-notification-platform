import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createConversationSchema, createGroupSchema } from "../validators/conversationValidators.js";
import { createConversation, getConversations, createGroupConversation, createOneToOneConversation  } from "../controllers/conversationController.js";

const router = express.Router();

// 1 to 1 conversation
router.post(
    "/",
    protect,
    validateRequest(createConversationSchema),
    createConversation
);

// get all conversations of logged-in user
router.get(
    "/",
    protect,
    getConversations,
);

// group conversation
router.post(
    "/group",
    protect,
    validateRequest(createGroupSchema),
    createGroupConversation
);

//one-to-one conversation
router.post(
    "/one-to-one",
    protect,
    createOneToOneConversation
);

export default router;