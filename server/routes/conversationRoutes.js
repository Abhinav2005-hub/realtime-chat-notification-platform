import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createGroupSchema } from "../validators/conversationValidators.js";
import { createGroupConversation } from "../controllers/conversationController.js";

const router = express.Router();

router.post(
    "/group",
    validateRequest(createGroupSchema),
    protect,
    createGroupConversation
);

export default router;