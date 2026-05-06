const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Cloudinary config (tumhare keys)
cloudinary.config({
  cloud_name: "dqdfdfzqd",
  api_key: "423525133597936",
  api_secret: "pYU6ketec9OShBHqitU_LIGPFto"
});

// ✅ MongoDB connect (Atlas string .env me dalna)
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

// ✅ Product schema
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  catalogue: String,
  image: String,
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model("Product", ProductSchema);

// ✅ About & Contact schema
const AboutSchema = new mongoose.Schema({ text: String });
const ContactSchema = new mongoose.Schema({ address: String, phone: String, email: String });
const About = mongoose.model("About", AboutSchema);
const Contact = mongoose.model("Contact", ContactSchema);

// ✅ Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// ✅ Get all products
app.get("/products", async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

// ✅ Add product (Cloudinary upload)
app.post("/products", upload.single("image"), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      catalogue: req.body.catalogue,
      image: result.secure_url
    });
    await newProduct.save();
    res.json(newProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image upload failed" });
  }
});

// ✅ Delete product
app.delete("/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ✅ About Us
app.get("/about", async (req, res) => {
  const about = await About.findOne();
  res.json(about);
});
app.post("/about", async (req, res) => {
  await About.deleteMany({});
  const about = new About({ text: req.body.about });
  await about.save();
  res.json(about);
});

// ✅ Contact Us
app.get("/contact", async (req, res) => {
  const contact = await Contact.findOne();
  res.json(contact);
});
app.post("/contact", async (req, res) => {
  await Contact.deleteMany({});
  const contact = new Contact(req.body);
  await contact.save();
  res.json(contact);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
