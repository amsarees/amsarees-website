const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Static folder for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Storage setup for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // images will be saved here
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// In-memory product list (replace with DB if needed)
let products = [];

// Route: Get all products
app.get("/products", (req, res) => {
  res.json(products);
});

// Route: Add product with image upload
app.post("/add-product", upload.single("image"), (req, res) => {
  const { name, price, quantity } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

  const product = { name, price, quantity, image: imageUrl };
  products.push(product);

  res.json({ message: "Product added successfully!", product });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
