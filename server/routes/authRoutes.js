import express from "express";
import { register, login } from "../controllers/authController.js";
import validateRequest from "../middleware/validateRequest.js";
import { registerSchema, loginSchema} from "../validators/authvalidator.js";
import { protect } from "../middleware/authMiddleware.js"
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);

router.get("/me", protect, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                name: true,
                email: true
            }
        });

        res.json({ user });

    } catch (error) {
        console.error("ME ERROR:", error);
        res.status(500).json({ message: "Server error" })
    }
});

export default router;