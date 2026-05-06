const express = require("express");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Cloudinary config
cloudinary.config({
  cloud_name: "dqdfdfzqd",
  api_key: "423525133597936",
  api_secret: "pYU6ketec9OShBHqitU_LIGPFto"
});

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Schemas
const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
  catalogue: String,
  image: String,
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model("Product", ProductSchema);

const About = mongoose.model("About", new mongoose.Schema({ text: String }));
const Contact = mongoose.model("Contact", new mongoose.Schema({ address: String, phone: String, email: String }));

// Multer
const upload = multer({ dest: "uploads/" });

// Routes
app.get("/products", async (req, res) => res.json(await Product.find().sort({ createdAt: -1 })));

app.post("/products", upload.single("image"), async (req, res) => {
  const result = await cloudinary.uploader.upload(req.file.path);
  const product = new Product({ ...req.body, image: result.secure_url });
  await product.save();
  res.json(product);
});

app.delete("/products/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.get("/about", async (req, res) => res.json(await About.findOne()));
app.post("/about", async (req, res) => {
  await About.deleteMany({});
  const about = new About({ text: req.body.about });
  await about.save();
  res.json(about);
});

app.get("/contact", async (req, res) => res.json(await Contact.findOne()));
app.post("/contact", async (req, res) => {
  await Contact.deleteMany({});
  const contact = new Contact(req.body);
  await contact.save();
  res.json(contact);
});

app.listen(process.env.PORT || 10000);
