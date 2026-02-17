import express from "express";
import { getMessages, markMessagesSeen, deleteMessage } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { getMessageSchema, markSeenSchema } from "../validators/messageValidators.js";

const router = express.Router();

router.get(
  "/:conversationId",
  validateRequest(getMessageSchema, "params"),
  protect,
  getMessages
);

router.post(
  "/seen",
  validateRequest(markSeenSchema),
  protect,
  markMessagesSeen
);

// DELETE MESSAGE
router.delete("/:id", protect, deleteMessage);

export default router;
