const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

// show login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// login system
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
