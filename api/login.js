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
  const aBuffer = Buffer.from(a || "");
  const bBuffer = Buffer.from(b || "");

  if (aBuffer.length !== bBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function createSessionToken() {
  const payload = {
    username: process.env.ADMIN_USERNAME,
    expires: Date.now() + 12 * 60 * 60 * 1000
  };

  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", process.env.SESSION_SECRET)
    .update(encoded)
    .digest("base64url");

  return encoded + "." + signature;
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

    if (payload.expires < Date.now()) {
      return false;
    }

    return payload.username === process.env.ADMIN_USERNAME;
  } catch (error) {
    return false;
  }
}

function verifyCredentials(username, password) {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  );
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    return res.status(200).json({
      authenticated: isAdmin(req)
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const body =
      typeof req.body === "object"
        ? req.body
        : JSON.parse(req.body || "{}");

    const username = String(body.username || "");
    const password = String(body.password || "");

    if (!verifyCredentials(username, password)) {
      return res.status(401).json({
        error: "Invalid username or password"
      });
    }

    const token = createSessionToken();

    res.setHeader(
      "Set-Cookie",
      `admin_session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`
    );

    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Server error"
    });
  }
};