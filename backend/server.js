const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Read products.json file
function getProducts() {
  const data = fs.readFileSync("products.json");
  return JSON.parse(data);
}

// Get products
app.get("/products", (req, res) => {
  const products = getProducts();
  res.json(products);
});

// Add product
app.post("/add-product", (req, res) => {
  const products = getProducts();
  products.push(req.body);
  fs.writeFileSync("products.json", JSON.stringify(products, null, 2));
  res.json({ message: "Product added successfully!" });
});

app.listen(3000, () => console.log("Backend running on port 3000"));
