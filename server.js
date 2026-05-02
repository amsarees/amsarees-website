const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static(__dirname)); // serve html files

// homepage
app.get("/", (req, res) => {
  res.send("AMSAREES WEBSITE WORKING ✅");
});

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

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
