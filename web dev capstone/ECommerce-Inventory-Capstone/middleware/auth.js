const jwt = require("jsonwebtoken");
const User = require("../models/User");
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: "Access token required" });
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: "Account unavailable" });
    req.user = user;
    next();
  } catch (err) { res.status(401).json({ success: false, message: "Invalid or expired access token" }); }
}
function allowRoles(...roles) {
  return (req, res, next) => roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ success: false, message: "Insufficient role permissions" });
}
module.exports = { protect, allowRoles };