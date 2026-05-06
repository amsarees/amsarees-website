const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(cors());
app.use(express.json());

// Multer setup (temporary local save)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// ✅ Cloudinary config (tumhare keys)
cloudinary.config({
  cloud_name: "dqdfdfzqd",              // 👈 tumhara Cloud Name
  api_key: "423525133597936",           // 👈 tumhara API Key
  api_secret: "pYU6ketec9OShBHqitU_LIGPFto" // 👈 tumhara API Secret
});

// Products file
const productsFile = path.join(__dirname, "products.json");
function loadProducts() {
  if (!fs.existsSync(productsFile)) return [];
  return JSON.parse(fs.readFileSync(productsFile));
}
function saveProducts(products) {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
}

// Get all products
app.get("/products", (req, res) => {
  res.json(loadProducts());
});

// Add product (upload to Cloudinary)
app.post("/products", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path); // ✅ Upload to Cloudinary
    let products = loadProducts();
    const newProduct = {
      id: Date.now(),
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      catalogue: req.body.catalogue,
      image: result.secure_url, // ✅ Permanent Cloudinary URL
      createdAt: Date.now()
    };
    products.push(newProduct);
    saveProducts(products);
    res.json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image upload failed" });
  }
});

// Delete product
app.delete("/products/:id", (req, res) => {
  let products = loadProducts();
  products = products.filter(p => p.id != req.params.id);
  saveProducts(products);
  res.json({ success: true });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
