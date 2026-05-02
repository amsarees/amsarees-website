const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// folders setup
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync("products.json")) fs.writeFileSync("products.json", "[]");

// load products
let products = JSON.parse(fs.readFileSync("products.json"));

function save(){
  fs.writeFileSync("products.json", JSON.stringify(products, null, 2));
}

// upload setup
const storage = multer.diskStorage({
  destination: (req,file,cb)=>cb(null,"uploads/"),
  filename:(req,file,cb)=>cb(null,Date.now()+"-"+file.originalname)
});

const upload = multer({storage});
app.use("/uploads", express.static("uploads"));

// LOGIN (ADMIN)
const USER = "amsareescentre";
const PASS = "amsarees786@";

let loggedIn = false;

// login api
app.post("/login",(req,res)=>{
  const {username,password} = req.body;

  if(username === USER && password === PASS){
    loggedIn = true;
    res.json({success:true});
  } else {
    res.json({success:false});
  }
});

// ADD PRODUCT (ADMIN ONLY)
app.post("/add-product", upload.single("image"), (req,res)=>{

  if(!loggedIn){
    return res.json({success:false, message:"Login required"});
  }

  const product = {
    id: Date.now(),
    name: req.body.name,
    price: req.body.price,
    category: req.body.category,
    image: "/uploads/" + req.file.filename
  };

  products.push(product);
  save();

  res.json({success:true});
});

// GET PRODUCTS (PUBLIC)
app.get("/products",(req,res)=>{
  res.json(products);
});

// 🗑️ DELETE PRODUCT (ADMIN ONLY)
app.delete("/delete-product/:id",(req,res)=>{

  if(!loggedIn){
    return res.json({
      success:false,
      message:"Login required"
    });
  }

  const id = parseInt(req.params.id);

  products = products.filter(p => p.id !== id);
  save();

  res.json({success:true});
});

// SERVER START (FIXED)
const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
  console.log("Server running on port " + PORT);
});
