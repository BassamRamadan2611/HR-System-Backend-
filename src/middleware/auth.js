const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  console.log('🔐 Auth middleware called for:', req.method, req.path);
  
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log('Token received:', token ? 'Yes' : 'No');
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ error: "Access denied, no token provided" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    console.log('✅ Token decoded successfully, user:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

exports.adminOnly = (req, res, next) => {
  console.log('👮 Admin check for user:', req.user);
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied, admin only" });
  }
  next();
};

exports.managerOrAdmin = (req, res, next) => {
  console.log('👨‍💼 Manager/Admin check for user:', req.user);
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return res.status(403).json({ error: "Access denied, manager or admin only" });
  }
  next();
};