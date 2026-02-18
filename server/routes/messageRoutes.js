import express from "express";
import { getMessages, markMessagesSeen, deleteMessage, editMessage } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { getMessageSchema, markSeenSchema, editMessageSchema } from "../validators/messageValidators.js";

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

router.put(
    "/:id",
    validateRequest(editMessageSchema),
    protect,
    editMessage
)

// DELETE MESSAGE
router.delete("/:id", protect, deleteMessage);

export default router;
