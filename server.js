const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

let otpStore = {};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "a.m.sareescentre@gmail.com",
    pass: "YOUR_APP_PASSWORD"
  }
});

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);

  otpStore[email] = otp;

  await transporter.sendMail({
    from: "A.M Sarees",
    to: email,
    subject: "Your OTP Login",
    text: `Your OTP is ${otp}`
  });

  res.send({ success: true });
});

app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] == otp) {
    res.send({ success: true });
  } else {
    res.send({ success: false });
  }
});

app.listen(3000, () => console.log("Server running"));
