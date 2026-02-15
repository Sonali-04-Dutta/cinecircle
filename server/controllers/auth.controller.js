import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const getInitialRole = (email) => {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return adminEmails.includes(String(email).toLowerCase()) ? "admin" : "user";
};

const isAdminEmail = (email) => getInitialRole(email) === "admin";

const isAdminPasswordValid = (password) => {
  const adminPass = process.env.ADMIN_PASS;
  return Boolean(adminPass) && password === adminPass;
};

const adminNameFromEmail = (email) => {
  const localPart = String(email || "").split("@")[0] || "admin";
  return localPart.replace(/[._-]+/g, " ").trim() || "admin";
};

const buildAuthPayload = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || "",
  role: user.role || "user",
  token: generateToken(user._id),
});

const ensureAdminRoleFromEmail = async (user) => {
  const shouldBeAdmin = getInitialRole(user.email) === "admin";
  if (shouldBeAdmin && user.role !== "admin") {
    user.role = "admin";
    await user.save();
  }
};

// REGISTER
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: getInitialRole(email),
      otp,
      otpExpires,
      isVerified: false,
    });

    await sendEmail(user.email, "Verify your CineCircle Account", otp);

    res.status(201).json({
      message: "Registration successful. Please check your email for the OTP.",
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VERIFY OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });
    if (user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await ensureAdminRoleFromEmail(user);
    await user.save();

    res.json(buildAuthPayload(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// RESEND OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail(user.email, "Your new CineCircle OTP", otp);
    res.json({ message: "New OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GOOGLE LOGIN
export const googleLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;

    // 1. Get user info from Google using the access token
    const googleResponse = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );

    const { sub: googleId, email, name, picture: avatar } = googleResponse.data;

    // 2. Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // 3. Create new user if they don't exist
      // We don't set a password for Google users
      user = await User.create({
        name,
        email,
        avatar,
        googleId,
        role: getInitialRole(email),
        isVerified: true, // Google users are pre-verified
      });
    } else if (!user.googleId) {
      // 4. Link Google ID to existing email account if not already linked
      user.googleId = googleId;
      if (!user.avatar) user.avatar = avatar; // Update avatar if they don't have one
      await user.save();
    }

    await ensureAdminRoleFromEmail(user);

    res.json(buildAuthPayload(user));
  } catch (error) {
    res.status(400).json({ message: "Google authentication failed" });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (isAdminEmail(email) && isAdminPasswordValid(password)) {
      let adminUser = await User.findOne({ email });

      if (!adminUser) {
        adminUser = await User.create({
          name: adminNameFromEmail(email),
          email,
          role: "admin",
          isVerified: true,
        });
      } else {
        let shouldSave = false;

        if (adminUser.role !== "admin") {
          adminUser.role = "admin";
          shouldSave = true;
        }
        if (!adminUser.isVerified) {
          adminUser.isVerified = true;
          shouldSave = true;
        }
        if (!adminUser.name) {
          adminUser.name = adminNameFromEmail(email);
          shouldSave = true;
        }

        if (shouldSave) {
          await adminUser.save();
        }
      }

      return res.json(buildAuthPayload(adminUser));
    }

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.password) {
      return res.status(400).json({ message: "Use Google sign-in for this account" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      // Generate a fresh OTP so the user can verify immediately
      const otp = crypto.randomInt(100000, 999999).toString();
      user.otp = otp;
      user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      await sendEmail(user.email, "Verify your CineCircle Account", otp);

      return res.status(401).json({ 
        message: "Please verify your email. A new OTP has been sent to your inbox.",
        isUnverified: true,
        email: user.email 
      });
    }

    await ensureAdminRoleFromEmail(user);
    res.json(buildAuthPayload(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
