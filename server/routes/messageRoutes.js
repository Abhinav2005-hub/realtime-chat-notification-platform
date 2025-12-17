import express from "express";
import { getMessages } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { getMessageSchema } from "../validators/messageValidators.js";

const router = express.Router();

router.get(
    "/:conversationId",
    validateRequest(getMessageSchema, "params"),
    protect,
    getMessages
);

export default router;