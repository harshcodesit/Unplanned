
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  
  const token =
    req.cookies?.token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

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
    console.error("JWT Verification error:", err);
    return res.status(403).json({
      errors: [{ msg: "Invalid or expired token. Please log in again." }],
    });
  }
};

const optionalVerifyToken = (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers.authorization && req.headers.authorization.split(" ")[1]);

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {

    }
  }
  next();
};

verifyToken.verifyToken = verifyToken;
verifyToken.optionalVerifyToken = optionalVerifyToken;

module.exports = verifyToken;