const crypto = require("crypto");

function parseCookies(req) {
  const header = req.headers.cookie || "";
  const cookies = {};

  header.split(";").forEach(part => {
    const [key, ...value] = part.trim().split("=");

    if (key) {
      cookies[key] = decodeURIComponent(value.join("="));
    }
  });

  return cookies;
}

function safeEqual(a, b) {
  const first = Buffer.from(a || "");
  const second = Buffer.from(b || "");

  if (first.length !== second.length) {
    return false;
  }

  return crypto.timingSafeEqual(first, second);
}

function verifyCredentials(username, password) {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}

function createSessionToken() {
  const payload = {
    username: process.env.ADMIN_USERNAME,
    expires: Date.now() + 12 * 60 * 60 * 1000
  };

  const encoded = Buffer
    .from(JSON.stringify(payload))
    .toString("base64url");

  const signature = crypto
    .createHmac("sha256", process.env.SESSION_SECRET)
    .update(encoded)
    .digest("base64url");

  return `${encoded}.${signature}`;
}

function isAdmin(req) {
  try {
    const cookies = parseCookies(req);
    const token = cookies.admin_session;

    if (!token || !process.env.SESSION_SECRET) {
      return false;
    }

    const parts = token.split(".");

    if (parts.length !== 2) {
      return false;
    }

    const [encoded, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.SESSION_SECRET)
      .update(encoded)
      .digest("base64url");

    if (!safeEqual(signature, expectedSignature)) {
      return false;
    }

    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    );

    if (payload.expires <= Date.now()) {
      return false;
    }

    return payload.username === process.env.ADMIN_USERNAME;
  } catch (error) {
    return false;
  }
}

function getSessionCookie(token) {
  return `admin_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`;
}

function getClearCookie() {
  return "admin_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}

module.exports = {
  parseCookies,
  verifyCredentials,
  createSessionToken,
  isAdmin,
  getSessionCookie,
  getClearCookie
};