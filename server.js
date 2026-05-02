const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

// VERY IMPORTANT (serve all files)
app.use(express.static(path.join(__dirname)));

// login details
const USERNAME = "amsareescentre";
const PASSWORD = "amsarees786@";

// login API
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === USERNAME && password === PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// homepage (ONLY if root)
app.get("/", (req, res) => {
  res.send("AMSAREES WEBSITE WORKING ✅");
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
