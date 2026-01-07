import express from "express";
import { register, login } from "../controllers/authController.js";
import validateRequest from "../middleware/validateRequest.js";
import { registerSchema, loginSchema} from "../validators/authvalidator.js";
import { protect } from "../middleware/authMiddleware.js"

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);

router.get("/me", protect, (req, res) => {
    res.json({ userId: req.userId });
});

export default router;