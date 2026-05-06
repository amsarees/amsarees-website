const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Load products.json
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

// Add product
app.post("/products", upload.single("image"), (req, res) => {
  let products = loadProducts();
  const newProduct = {
    id: Date.now(),
    name: req.body.name,
    price: req.body.price,
    quantity: req.body.quantity,
    image: "/uploads/" + req.file.filename,
    createdAt: Date.now()
  };
  products.push(newProduct);
  saveProducts(products);
  res.json(newProduct);
});

// Delete product
app.delete("/products/:id", (req, res) => {
  let products = loadProducts();
  products = products.filter(p => p.id != req.params.id);
  saveProducts(products);
  res.json({ success: true });
});

// About Us
app.post("/about", (req, res) => {
  fs.writeFileSync(path.join(__dirname, "about.json"), JSON.stringify(req.body));
  res.json({ success: true });
});
app.get("/about", (req, res) => {
  if (!fs.existsSync(path.join(__dirname, "about.json"))) return res.json({});
  res.json(JSON.parse(fs.readFileSync(path.join(__dirname, "about.json")));
});

// Contact Us
app.post("/contact", (req, res) => {
  fs.writeFileSync(path.join(__dirname, "contact.json"), JSON.stringify(req.body));
  res.json({ success: true });
});
app.get("/contact", (req, res) => {
  if (!fs.existsSync(path.join(__dirname, "contact.json"))) return res.json({});
  res.json(JSON.parse(fs.readFileSync(path.join(__dirname, "contact.json")));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
