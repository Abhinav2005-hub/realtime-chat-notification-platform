import express from "express";
import { getMessages, markMessagesSeen } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { getMessageSchema, markSeenSchema } from "../validators/messageValidators.js";

const router = express.Router();

router.get(
    "/:conversationId",
    protect,
    validateRequest(getMessageSchema, "params"),
    getMessages
);

router.post(
    "/seen",
    protect,
    validateRequest(markSeenSchema),
    markMessagesSeen
  );
  
export default router;