const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// create uploads folder
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));

// products
let products = [];

// show admin page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// login
const USERNAME = "amsareescentre";
const PASSWORD = "amsarees786@";

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === USERNAME && password === PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// upload product
app.post("/add-product", upload.single("image"), (req, res) => {
  const name = req.body.name;
  const price = req.body.price;
  const image = "/uploads/" + req.file.filename;

  products.push({ name, price, image });
  res.json({ success: true });
});

// get products
app.get("/products", (req, res) => {
  res.json(products);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
