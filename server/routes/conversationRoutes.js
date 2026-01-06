import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createGroupSchema } from "../validators/conversationValidators.js";
import { getConversations, createGroupConversation, createOneToOneConversation  } from "../controllers/conversationController.js";

const router = express.Router();

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