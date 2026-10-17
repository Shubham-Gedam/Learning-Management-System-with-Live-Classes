export function internalServiceMiddleware(req, res, next) {
  const expectedSecret = process.env.INTERNAL_SERVICE_SECRET;
  const providedSecret = req.get("x-internal-service-key");

  if (!expectedSecret) {
    return res.status(500).json({
      message: "Internal service secret is not configured",
      status: "failed",
    });
  }

  if (!providedSecret || providedSecret !== expectedSecret) {
    return res.status(403).json({
      message: "Internal service access denied",
      status: "failed",
    });
  }

  return next();
}