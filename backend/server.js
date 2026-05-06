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

// Cloudinary config
cloudinary.config({
  cloud_name: "dqdfdfzqd",
  api_key: "423525133597936",
  api_secret: "pYU6ketec9OShBHqitU_LIGPFto"
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
    const result = await cloudinary.uploader.upload(req.file.path);
    let products = loadProducts();
    const newProduct = {
      id: Date.now(),
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      catalogue: req.body.catalogue,
      image: result.secure_url, // ✅ permanent Cloudinary URL
      createdAt: Date.now()
    };
    products.push(newProduct);
    saveProducts(products);
    res.json(newProduct);
  } catch (err) {
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
