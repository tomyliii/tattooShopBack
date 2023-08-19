const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const formData = require("form-data");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URI);
const cloudinary = require("cloudinary");
const MailGun = require("mailgun.js");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_PUBLIC,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const mailgun = new MailGun(formData);
const client = mailgun.client({
  username: "Thomas S.",
  key: process.env.MAILGUN_API_KEY,
});

app.use(cors());
app.use(express.json());

const admin = require("./Routes/admin");
app.use(admin);

const customer = require("./Routes/customer");
app.use(customer);

const item = require("./Routes/item");
app.use(item);

const textDescription = require("./Routes/texteDescription");
app.use(textDescription);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Bienvenue sur le Serveur" });
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "Cette route est introuvable" });
});

app.listen(process.env.PORT, () => {
  console.log("Server On");
});
