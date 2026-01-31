import express from "express";
import rateLimit from "express-rate-limit";
import {
  registerUser,
  loginUser,
  googleLogin,
  verifyOTP,
  resendOTP,
} from "../controllers/auth.controller.js";

const router = express.Router();

// General auth limiter to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: { message: "Too many attempts. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for resending OTP: 3 requests per 10 minutes
const resendOTPLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3, 
  message: { message: "Too many OTP requests. Please try again after 10 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/google", googleLogin);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTPLimiter, resendOTP);

export default router;