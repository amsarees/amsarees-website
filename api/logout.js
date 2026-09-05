const { isAdmin, getClearCookie } = require("../lib/auth");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  if (!isAdmin(req)) {
    return res.status(401).json({
      error: "Not logged in"
    });
  }

  res.setHeader("Set-Cookie", getClearCookie());

  return res.status(200).json({
    success: true
  });
};