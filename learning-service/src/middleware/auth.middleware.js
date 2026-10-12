import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        message: "Please log in first",
        status: "failed",
      });
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET);

    if (!decoded.userId || !decoded.role) {
      return res.status(401).json({
        message: "Invalid session. Please log in again.",
        status: "failed",
      });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired session",
      status: "failed",
    });
  }
}