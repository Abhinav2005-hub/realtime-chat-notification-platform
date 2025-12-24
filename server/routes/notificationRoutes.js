import express from "express";
import { saveFcmToken } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { saveTokenSchema } from "../validators/notificationValidators.js";

const router = express.Router();

router.post(
    "/token",
    validateRequest(saveTokenSchema),
    protect,
    saveFcmToken
);

export default router;