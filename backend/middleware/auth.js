const jwt = require("jsonwebtoken");

const normalizeBearerToken = (authorizationHeader = "") => {
  if (typeof authorizationHeader !== "string") return null;
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  let token = match[1].trim();
  if (!token) return null;

  if (
    (token.startsWith('"') && token.endsWith('"')) ||
    (token.startsWith("'") && token.endsWith("'"))
  ) {
    token = token.slice(1, -1).trim();
  }

  return token || null;
};

const authMiddleware = (req, res, next) => {
  const token = normalizeBearerToken(req.headers.authorization || "");
  if (!token) return res.status(401).json({ error: "Missing token" });

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    return res.status(500).json({ error: "Authentication is not configured on this server." });
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = { id: payload.id };
    return next();
  } catch (err) {
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
