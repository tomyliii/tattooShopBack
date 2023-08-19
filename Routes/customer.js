const express = require("express");
const router = express.Router();
const Item = require("../Models/Item");
const isAuthentificated = require("../Middleware/isAuthentificated");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const convertToBase64 = require("../Tools/convertToBase64");
const Customer = require("../Models/Customer");
const BookItem = require("../Models/BookItem");
const ProjectCustomer = require("../Models/ProjectCustomer");
const CustomerMessage = require("../Models/CustomerMessage");
const Mailgun = require("mailgun.js");
const formData = require("form-data");

const mailgun = new Mailgun(formData);
const client = mailgun.client({
  username: process.env.USERNAME,
  key: process.env.MAILGUN_API_KEY,
});

router.post("/customer/projectEdit", fileUpload(), async (req, res) => {
  const { mail, firstname, lastname, number, description, newsLetter } =
    req.body;

  try {
    const customer = await Customer.findOne({ mail: mail });
    if (customer) {
      const newProjectCustomer = new ProjectCustomer({
        customer,
        description,
        dateOfCreation: new Date(),
      });

      const arrayOfPictures = req.files.images;

      if (arrayOfPictures.length) {
        const arrayOfPromises = arrayOfPictures.map((picture) => {
          return cloudinary.uploader.upload(convertToBase64(picture), {
            folder: "/tatooShop/tatoo/" + newProjectCustomer._id,
          });
        });

        const pictures = await Promise.all(arrayOfPromises);

        pictures.forEach((picture) => {
          const image = {
            public_id: picture.public_id,
            secure_url: picture.secure_url,
          };

          newProjectCustomer.images.push(image);
        });
      } else {
        const picture = await cloudinary.uploader.upload(
          convertToBase64(arrayOfPictures),
          {
            folder: "/tatooShop/ProjectCustomer/" + newProjectCustomer._id,
          }
        );

        const image = {
          public_id: picture.public_id,
          secure_url: picture.secure_url,
        };
        newProjectCustomer.images.push(image);
      }
      const messageData = {
        from: `${firstname} ${lastname} <${mail} >`,
        to: process.env.USER_MAIL,
        subject: `Projet tattoo`,
        text: description,
      };

      const responseMailGun = await client.messages.create(
        process.env.MAILGUN_DOMAIN,
        messageData
      );

      await newProjectCustomer.save();
      return res.status(201).json({ message: "Demande validée." });
    } else {
      const newCustomer = new Customer({
        firstname,
        lastname,
        phoneNumber: number,
        mail,
        dateOfCreation: new Date(),
      });
      if (newsLetter) {
        newCustomer.newsLetter = true;
      }

      await newCustomer.save();
      const newProjectCustomer = new ProjectCustomer({
        customer: newCustomer,
        description,
        dateOfCreation: new Date(),
      });
      const arrayOfPictures = req.files.images;

      if (arrayOfPictures.length) {
        const arrayOfPromises = arrayOfPictures.map((picture) => {
          return cloudinary.uploader.upload(convertToBase64(picture), {
            folder: "/tatooShop/projectCustomer/" + newProjectCustomer._id,
          });
        });

        const pictures = await Promise.all(arrayOfPromises);

        pictures.forEach((picture) => {
          const image = {
            public_id: picture.public_id,
            secure_url: picture.secure_url,
          };

          newProjectCustomer.images.push(image);
        });
      } else {
        const picture = await cloudinary.uploader.upload(
          convertToBase64(arrayOfPictures),
          {
            folder: "/tatooShop/projectCustomer/" + newProjectCustomer._id,
          }
        );

        const image = {
          public_id: picture.public_id,
          secure_url: picture.secure_url,
        };
        newProjectCustomer.images.push(image);
      }

      const messageData = {
        from: `${firstname} ${lastname} <${mail} >`,
        to: process.env.USER_MAIL,
        subject: `Projet tattoo`,
        text: description,
      };

      const responseMailGun = await client.messages.create(
        process.env.MAILGUN_DOMAIN,
        messageData
      );

      await newProjectCustomer.save();

      return res.status(201).json({ message: "Demande validée." });
    }
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

router.post("/customer/message", async (req, res) => {
  const { mail, firstname, lastname, number, message, newsLetter } = req.body;
  try {
    const customer = await Customer.findOne({ mail: mail });
    if (customer) {
      const newCustomerMessage = new CustomerMessage({
        customer,
        message,
        dateOfCreation: new Date(),
      });

      const messageData = {
        from: `${firstname} ${lastname} <${mail} >`,
        to: process.env.USER_MAIL,
        subject: `Message Contact`,
        text: message,
      };

      const responseMailGun = await client.messages.create(
        process.env.MAILGUN_DOMAIN,
        messageData
      );

      await newCustomerMessage.save();
      return res.status(201).json({ message: "Message envoyé." });
    } else {
      const newCustomer = new Customer({
        firstname,
        lastname,
        phoneNumber: number,
        mail,
        dateOfCreation: new Date(),
      });
      if (newsLetter) {
        newCustomer.newsLetter = true;
      }

      await newCustomer.save();
      const newCustomerMessage = new CustomerMessage({
        customer: newCustomer,
        message,
        dateOfCreation: new Date(),
      });

      const messageData = {
        from: `${firstname} ${lastname} <${mail} >`,
        to: process.env.USER_MAIL,
        subject: `Message Contact`,
        text: message,
      };

      const responseMailGun = await client.messages.create(
        process.env.MAILGUN_DOMAIN,
        messageData
      );

      await newCustomerMessage.save();

      return res.status(201).json({ message: "Message envoyé." });
    }
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

module.exports = router;
