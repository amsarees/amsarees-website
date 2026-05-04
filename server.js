const express = require("express");
const multer = require("multer");
const fs = require("fs");
const session = require("express-session");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// SESSION (SECURE LOGIN)
app.use(session({
  secret: "amsarees-secret",
  resave: false,
  saveUninitialized: true
}));

// CLOUDINARY
cloudinary.config({
  cloud_name: "dqdfdfzqd",
  api_key: "YOUR_API_KEY",
  api_secret: "YOUR_API_SECRET"
});

// DATA
if (!fs.existsSync("products.json")) fs.writeFileSync("products.json","[]");
let products = JSON.parse(fs.readFileSync("products.json"));

function save(){
  fs.writeFileSync("products.json", JSON.stringify(products,null,2));
}

// LOGIN
app.post("/login",(req,res)=>{
  const {username,password}=req.body;
  if(username==="amsareescentre" && password==="amsarees786@"){
    req.session.admin=true;
    res.json({success:true});
  } else res.json({success:false});
});

// LOGOUT
app.get("/logout",(req,res)=>{
  req.session.destroy();
  res.json({success:true});
});

// UPLOAD
const upload = multer({ storage: multer.memoryStorage() });

app.post("/add-product", upload.single("image"), (req,res)=>{
  if(!req.session.admin) return res.json({success:false});

  let stream = cloudinary.uploader.upload_stream(
    { folder:"sarees" },
    (err,result)=>{

      const product={
        id:Date.now(),
        name:req.body.name,
        price:req.body.price,
        category:req.body.category,
        image:result.secure_url,
        public_id: result.public_id
      };

      products.push(product);
      save();
      res.json({success:true});
    }
  );

  streamifier.createReadStream(req.file.buffer).pipe(stream);
});

// GET
app.get("/products",(req,res)=>{
  res.json(products);
});

// DELETE (WITH CLOUD DELETE)
app.delete("/delete-product/:id",(req,res)=>{
  if(!req.session.admin) return res.json({success:false});

  let product = products.find(p=>p.id==req.params.id);

  if(product){
    cloudinary.uploader.destroy(product.public_id);
  }

  products = products.filter(p=>p.id!=req.params.id);
  save();

  res.json({success:true});
});

// EDIT PRODUCT
app.put("/edit-product/:id",(req,res)=>{
  if(!req.session.admin) return res.json({success:false});

  let p = products.find(x=>x.id==req.params.id);

  if(p){
    p.name = req.body.name;
    p.price = req.body.price;
    p.category = req.body.category;
    save();
  }

  res.json({success:true});
});

app.listen(process.env.PORT||3000);
