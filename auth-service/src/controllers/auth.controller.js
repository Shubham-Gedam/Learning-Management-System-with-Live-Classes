import userModel from "../models/User.model.js";
import jwt from "jsonwebtoken";
// import * as emailService from "../services/email.service.js";
import tokenBlackListModel from "../models/blocklist.model.js";

export async function registerController(req, res) {
  const { email, password, name } = req.body;

  const isExsts = await userModel.findOne({ email: email });

  if (isExsts) {
    return res.status(422).json({
      message: "Email already exists, please use a different email address",
      status: "failed",
    });
  }

  const user = await userModel.create({
    email,
    password,
    name,
  });
  const token = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "3d" },
  );

  res.cookie("token", token);

  res.status(201).json({
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    token: token,
    message: "User registered successfully",
    status: "success",
  });
  //   await emailService.sendRegistrationEmail(user.email, user.name);
}

export async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    const user = await userModel
      .findOne({ email: email.trim().toLowerCase() })
      .select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found, please register first",
        status: "failed",
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
        status: "failed",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
      message: "User logged in successfully",
      status: "success",
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
      status: "failed",
    });
  }
}

export async function userLogoutController(req, res) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(200).json({
      message: "User logged out successfully",
    });
  }

  await tokenBlackListModel.create({
    token: token,
  });

  res.clearCookie("token");

  res.status(200).json({
    message: "user logged out successfully",
  });
}

export async function getUserForLiveClassController(req, res) {
  try {
    const internalKey = process.env.INTERNAL_SERVICE_SECRET;

    if (!internalKey || req.headers["x-internal-service-key"] !== internalKey) {
      return res.status(403).json({
        message: "Forbidden",
        status: "failed",
      });
    }

    const { userId } = req.params;

    const user = await userModel.findById(userId).select("name role");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        status: "failed",
      });
    }

    return res.status(200).json({
      status: "success",
      data: {
        userId: user._id.toString(),
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid user ID",
        status: "failed",
      });
    }

    return res.status(500).json({
      message: "Failed to fetch user",
      status: "failed",
    });
  }
}
