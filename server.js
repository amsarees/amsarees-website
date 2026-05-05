const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let products = [
  {
    name: "Soft Silk Saree",
    price: 1699,
    quantity: 10,
    image: "https://via.placeholder.com/200x250?text=Soft+Silk+Saree"
  },
  {
    name: "Cotton Saree",
    price: 1499,
    quantity: "", // blank → homepage pe "Quantity" text nahi aayega
    image: "https://via.placeholder.com/200x250?text=Cotton+Saree"
  }
];

// Get products
app.get("/products", (req, res) => {
  res.json(products);
});

// Add product (Admin Panel ke liye)
app.post("/add-product", (req, res) => {
  products.push(req.body);
  res.json({ message: "Product added successfully!" });
});

app.listen(3000, () => console.log("Backend running on port 3000"));
