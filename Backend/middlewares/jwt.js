const jwt = require("jsonwebtoken");

const extractToken = (req) => {
  if (req.cookies?.token) return req.cookies.token;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

const verifyToken = (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      errors: [{ msg: "Access denied. No token provided. Please log in." }],
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      errors: [{ msg: "Invalid or expired token. Please log in again." }],
    });
  }
};

const optionalVerifyToken = (req, res, next) => {
  const token = extractToken(req);

  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // Intentionally ignore invalid optional tokens to continue as guest
    }
  }

  next();
};

module.exports = {
  verifyToken,
  optionalVerifyToken,
};