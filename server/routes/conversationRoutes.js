import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createGroupSchema } from "../validators/conversationValidators.js";

import {
  getConversations,
  createGroupConversation,
  createOneToOneConversation,
} from "../controllers/conversationController.js";

const router = express.Router();

/* GET ALL USER CONVERSATIONS */
router.get(
  "/",
  protect,
  getConversations
);

/* CREATE 1-TO-1 CONVERSATION */
router.post(
  "/one-to-one",
  protect,
  createOneToOneConversation
);

/* CREATE GROUP CONVERSATION */
router.post(
  "/group",
  protect,
  validateRequest(createGroupSchema),
  createGroupConversation
);

export default router;
