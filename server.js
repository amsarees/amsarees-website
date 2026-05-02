const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// STORE PRODUCTS (temporary memory)
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

// ADD PRODUCT
app.post("/add-product", (req, res) => {
  const { name, price, image } = req.body;

  products.push({ name, price, image });
  res.json({ success: true });
});

// GET PRODUCTS
app.get("/products", (req, res) => {
  res.json(products);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
