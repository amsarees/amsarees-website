const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

// SHOW LOGIN PAGE ON HOME
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// LOGIN DETAILS
const USERNAME = "amsareescentre";
const PASSWORD = "amsarees786@";

// LOGIN API
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === USERNAME && password === PASSWORD) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
