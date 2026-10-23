import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";

// @route POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role: requestedRole } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    // Bootstrap: if no admin exists in the system, this user becomes admin automatically
    const adminCount = await User.countDocuments({ role: "admin" });
    let assignedRole;
    if (adminCount === 0) {
      assignedRole = "admin";
    } else {
      if (requestedRole === "admin") {
        return res.status(403).json({
          code: "ADMIN_SELF_REGISTRATION_FORBIDDEN",
          message: "Admin role cannot be self-registered. An existing Admin must grant Admin access.",
        });
      }
      const SELF_ASSIGNABLE = ["project_manager", "member", "viewer"];
      assignedRole = SELF_ASSIGNABLE.includes(requestedRole) ? requestedRole : "member";
    }

    const user = await User.create({ name, email, password, role: assignedRole });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// @route POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password, rememberMe, role: requestedRole } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Role-based login verification:
    // If a specific role is selected, verify that the user's account matches that role.
    // A viewer cannot just select "admin" and log in!
    if (requestedRole && requestedRole !== "any") {
      if (user.role !== requestedRole) {
        const ROLE_LABELS = {
          admin: "Admin",
          project_manager: "Project Manager",
          member: "Team Member",
          viewer: "Viewer",
        };
        const actualLabel = ROLE_LABELS[user.role] || user.role;
        const requestedLabel = ROLE_LABELS[requestedRole] || requestedRole;

        return res.status(403).json({
          code: "ROLE_MISMATCH",
          message: `Access denied: Your account is registered as "${actualLabel}", not "${requestedLabel}". A ${actualLabel} cannot log in as ${requestedLabel}.`,
        });
      }
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // "Remember me" -> longer-lived refresh token stored; otherwise still issued but
    // the frontend can choose to store it in sessionStorage instead of localStorage.
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
      rememberMe: !!rememberMe,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// @route POST /api/auth/refresh
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token required" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = generateAccessToken(user._id, user.role);
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: "Refresh token invalid or expired" });
  }
};

// @route POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    }
    res.json({ message: "Logged out" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
};

// @route GET /api/auth/me
export const getMe = async (req, res) => {
  res.json({ user: req.user.toSafeObject ? req.user.toSafeObject() : req.user });
};

// NOTE: Email verification, password-reset-via-email, and social login (Google/GitHub)
// are not wired up in this scaffold since they need a real mail provider + OAuth app
// credentials. Structure is ready for it: add a `resetToken`/`resetExpires` field to
// User, a nodemailer transport, and /api/auth/forgot-password + /reset-password routes.
