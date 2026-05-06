const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

let products = [];
let aboutInfo = "";
let contactInfo = "";

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Add product
app.post("/add-product", upload.single("image"), (req, res) => {
  const { name, price, quantity, catalogue } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

  const product = {
    id: Date.now(),
    name,
    price,
    quantity,
    catalogue,
    image: imageUrl,
    createdAt: Date.now()
  };

  products.push(product);
  res.json({ message: "Product added successfully!", product });
});

// Get products
app.get("/products", (req, res) => {
  res.json(products);
});

// Save About Us
app.post("/save-about", (req, res) => {
  aboutInfo = req.body.about;
  res.json({ message: "About Us saved successfully!", about: aboutInfo });
});

// Get About Us
app.get("/about", (req, res) => {
  res.json({ about: aboutInfo });
});

// Save Contact Us
app.post("/save-contact", (req, res) => {
  contactInfo = req.body.contact;
  res.json({ message: "Contact Us saved successfully!", contact: contactInfo });
});

// Get Contact Us
app.get("/contact", (req, res) => {
  res.json({ contact: contactInfo });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
