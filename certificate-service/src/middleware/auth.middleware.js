import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required. Please login.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId || decoded.id,
      role: decoded.role,
    };

    if (!req.user.userId) {
      return res.status(401).json({
        status: "error",
        message: "Invalid authentication token",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired token",
    });
  }
}