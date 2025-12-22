import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { blockUserSchema, deleteMessageSchema } from "../validators/adminValidators.js";
import { blockUser, unblockUser, deleteMessage } from "../controllers/adminController.js";

const router = express.Router();

router.post(
    "/block-user",
    validateRequest(blockUserSchema),
    protect,
    requireAdmin,
    blockUser
);

router.post(
    "/unblock-user",
    validateRequest(blockUserSchema),
    protect,
    requireAdmin,
    unblockUser
);

router.post(
    "/delete-message",
    validateRequest(deleteMessageSchema),
    protect,
    requireAdmin,
    deleteMessage
);

export default router;