const crypto = require("crypto");
const { isAdmin } = require("../lib/auth");

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  // Only admin can request a Cloudinary upload signature
  if (!isAdmin(req)) {
    return res.status(401).json({
      error: "Unauthorized"
    });
  }

  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(500).json({
        error: "Cloudinary environment variables are missing"
      });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "amsarees";

    const stringToSign =
      `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

    const signature = crypto
      .createHash("sha1")
      .update(stringToSign)
      .digest("hex");

    return res.status(200).json({
      cloud_name: cloudName,
      api_key: apiKey,
      timestamp,
      folder,
      signature
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Unable to create upload signature"
    });
  }
};