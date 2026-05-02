const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// uploads folder
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("products.json")) fs.writeFileSync("products.json", "[]");

let products = JSON.parse(fs.readFileSync("products.json"));

function saveProducts(){
  fs.writeFileSync("products.json", JSON.stringify(products, null, 2));
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

app.use("/uploads", express.static("uploads"));

// login
const USERNAME = "amsareescentre";
const PASSWORD = "amsarees786@";

app.post("/login", (req,res)=>{
  const {username,password} = req.body;
  if(username===USERNAME && password===PASSWORD){
    res.json({success:true});
  } else {
    res.json({success:false});
  }
});

// add product
app.post("/add-product", upload.single("image"), (req,res)=>{
  const product = {
    id: Date.now(),
    name: req.body.name,
    price: req.body.price,
    category: req.body.category || "general",
    image: "/uploads/" + req.file.filename
  };

  products.push(product);
  saveProducts();

  res.json({success:true});
});

// get products
app.get("/products", (req,res)=>{
  res.json(products);
});

// delete product
app.delete("/delete-product/:id", (req,res)=>{
  const id = parseInt(req.params.id);
  products = products.filter(p => p.id !== id);
  saveProducts();
  res.json({success:true});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log("Server running"));
