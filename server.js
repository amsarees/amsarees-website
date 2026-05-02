const express = require("express");
const app = express();

app.use(express.json());
app.use(express.static(__dirname));
// YOUR LOGIN DETAILS
const USERNAME = "amsarees";
const PASSWORD = "786@";

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
