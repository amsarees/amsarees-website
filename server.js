const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

// LOGIN DETAILS
const USERNAME = "amsareescentre";
const PASSWORD = "amsarees786@";

// SHOW admin.html on HOME
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// LOGIN API
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
