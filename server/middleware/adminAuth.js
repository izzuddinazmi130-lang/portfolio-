// Very small shared-secret check. Good enough for a personal portfolio's
// "let me update my own projects" use case - not a full auth system.
export function requireAdmin(req, res, next) {
  const token = req.header("x-admin-token");
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized. Missing or invalid x-admin-token header." });
  }
  next();
}
