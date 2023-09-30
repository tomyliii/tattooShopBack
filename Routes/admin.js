const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const base64 = require("crypto-js/enc-base64");
const Admin = require("../Models/Admin");
const convertToBase64 = require("../Tools/convertToBase64");
const isAuthentificated = require("../Middleware/isAuthentificated");
const BookItem = require("../Models/BookItem");
const CustomerMessage = require("../Models/CustomerMessage");
const ProjectCustomer = require("../Models/ProjectCustomer");
const Item = require("../Models/Item");
const Customer = require("../Models/Customer");
// router.post("/admin/createaccount", fileUpload(), async (req, res) => {
//   const { password, mail, number, firstname, lastname } = req.body;
//   try {
//     if (password && mail && firstname && lastname) {
//       const mailLowerCase = mail.toLowerCase().trim();
//       if (await Admin.findOne({ mail: mailLowerCase })) {
//         return res
//           .status(409)
//           .json({ message: "Adresse e-mail déjà utilisée." });
//       } else {
//         const salt = uid2(16);
//         token = uid2(16);
//         const hash = SHA256(password + salt).toString(base64);

//         const newAdmin = new Admin({
//           firstname,
//           lastname,
//           mail: mailLowerCase,
//           salt,
//           token,
//           hash,
//           dateOfCreation: new Date(),
//         });
//         if (number) {
//           newAdmin.phoneNumber = Number(number);
//         }
//         if (req.files?.avatar) {
//           const avatar = await cloudinary.uploader.upload(
//             convertToBase64(req.files.avatar),
//             {
//               folder: "/tatooShop/Admin/Avatar",
//               public_id: "avatar_" + newAdmin._id,
//             }
//           );
//           newAdmin.avatar = {
//             secure_url: avatar.secure_url,
//             public_id: avatar.public_id,
//           };
//         } else {
//           const avatar = await cloudinary.api.resources({
//             type: "upload",
//             prefix: "tatooShop/Admin/Standard/Avatar_Standard",
//           });

//           newAdmin.avatar = {
//             secure_url: avatar.resources[0].secure_url,
//             public_id: avatar.resources[0].public_id,
//           };
//         }
//         await newAdmin.save();
//         return res.status(201).json({
//           token,
//           message: "Compte créé avec succès.",
//           name: newAdmin.fullName,
//         });
//       }
//     } else {
//       return res.status(422).json({ message: "Informations manquantes" });
//     }
//   } catch (error) {
//     if (error.status) {
//       return res.status(error.status).json({ message: error.message });
//     } else {
//       return res.status(500).json({ message: error.message });
//     }
//   }
// });
router.post("/admin/login", async (req, res) => {
  try {
    const { password, mail } = req.body;
    if (mail && password) {
      const mailLowerCase = mail.toLowerCase().trim();
      const admin = await Admin.findOne({ mail: mailLowerCase });
      if (admin) {
        const newHash = SHA256(password + admin.salt).toString(base64);

        if (admin.hash === newHash) {
          return res.status(202).json({
            message: "Vous êtes connecté(e).",
            token: admin.token,
            name: admin.fullName,
          });
        } else {
          return res.status(401).json({
            message: "Adresse e-mail et/ou mot de passe incorecte(s)",
          });
        }
      } else {
        return res
          .status(400)
          .json({ message: "Adresse e-mail et/ou mot de passe incorecte(s)" });
      }
    } else {
      return res.status(400).json({ message: "Informations manquantes" });
    }
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});
router.get("/admin", isAuthentificated, async (req, res) => {
  try {
    return res.status(200).json(req.findAdmin);
  } catch {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

router.put(
  "/admin/update",
  isAuthentificated,
  fileUpload(),
  async (req, res) => {
    try {
      const admin = req.findAdmin;
      const { firstname, lastname, number, password, mail } = req.body;

      if (req.files?.avatar) {
        if (
          admin.avatar.public_id !== "tatooShop/Admin/Standard/Avatar_Standard"
        ) {
          await cloudinary.uploader.destroy(admin.avatar.public_id);
        }

        const response = await cloudinary.uploader.upload(
          convertToBase64(req.files.avatar),
          {
            folder: "/tatooShop/Admin/Avatar",
            public_id: "avatar_" + admin._id,
          }
        );
        admin.avatar.secure_url = response.secure_url;
        admin.avatar.public_id = response.public_id;
      }
      if (firstname) {
        admin.firstname = firstname;
      }
      if (lastname) {
        admin.lastname = lastname;
      }
      if (mail) {
        const mailLowerCase = mail.toLowerCase().trim();
        admin.mail = mailLowerCase;
      }
      if (number) {
        admin.phoneNumber = Number(number);
      }
      if (password) {
        const newToken = uid2(16);
        const newSalt = uid2(16);
        const newHash = SHA256(password + newSalt).toString(base64);
        admin.token = newToken;
        admin.hash = newHash;
        admin.salt = newSalt;
      }

      await admin.save();
      return res
        .status(202)
        .json({ message: "mise à jour réussie.", token: admin.token });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      } else {
        return res.status(500).json({ message: error.message });
      }
    }
  }
);

router.get("/admin/bookedtatoos", isAuthentificated, async (req, res) => {
  try {
    const { archived } = req.query;

    if (archived === "true") {
      const bookeditems = await BookItem.find().populate("customer item");
      return res.status(200).json(bookeditems);
    } else {
      const bookeditems = await BookItem.find({ archived: false }).populate(
        "customer item"
      );
      return res.status(200).json(bookeditems);
    }
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});
router.get("/admin/customersmessages", isAuthentificated, async (req, res) => {
  try {
    const { archived } = req.query;
    if (archived === "true") {
      const messages = await CustomerMessage.find().populate("customer");

      return res.status(200).json(messages);
    } else {
      const message = await CustomerMessage.find({ archived: false }).populate(
        "customer"
      );
      return res.status(200).json(message);
    }
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});
router.get("/admin/customersprojects", isAuthentificated, async (req, res) => {
  try {
    const { archived } = req.query;
    if (archived === "true") {
      const projects = await ProjectCustomer.find().populate("customer");
      return res.status(200).json(projects);
    } else {
      const projects = await ProjectCustomer.find({ archived: false }).populate(
        "customer"
      );
      return res.status(200).json(projects);
    }
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

router.get("/admin/customer/list", isAuthentificated, async (req, res) => {
  try {
    const customerList = await Customer.find();
    return res.status(200).json(customerList);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

router.put(
  "/admin/managebookedtatoo/:id",
  isAuthentificated,
  async (req, res) => {
    try {
      const id = req.params.id;
      const book = await BookItem.findById(id).populate("item");

      const newValue = !book.archived;

      book.archived = newValue;

      const tatoo = await Item.findById(book.item.id);

      tatoo.disable = !newValue;
      await tatoo.save();
      await book.save();
      return res.status(202).json({ message: "Flash mis à jour" });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      } else {
        return res.status(500).json({ message: error.message });
      }
    }
  }
);
router.put(
  "/admin/managemessagecustomer/:id",
  isAuthentificated,
  async (req, res) => {
    try {
      const id = req.params.id;
      const message = await CustomerMessage.findOne({ _id: id });
      const newValue = !message.archived;
      message.archived = newValue;
      await message.save();
      return res.status(202).json({ message: "Message mis à jour" });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      } else {
        return res.status(500).json({ message: error.message });
      }
    }
  }
);
router.put(
  "/admin/manageprojectcustomer/:id",
  isAuthentificated,
  async (req, res) => {
    try {
      const id = req.params.id;
      const project = await ProjectCustomer.findOne({ _id: id });
      const newValue = !project.archived;
      project.archived = newValue;
      await project.save();
      return res.status(202).json({ message: "Projet mis à jour" });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      } else {
        return res.status(500).json({ message: error.message });
      }
    }
  }
);

router.delete(
  "/admin/deletemessagecustomer/:id",
  isAuthentificated,
  async (req, res) => {
    try {
      const id = req.params.id;
      await CustomerMessage.findByIdAndDelete(id);

      return res.status(202).json({ message: "Message supprimé" });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      } else {
        return res.status(500).json({ message: error.message });
      }
    }
  }
);
router.delete(
  "/admin/deletebookcustomer/:id",
  isAuthentificated,
  async (req, res) => {
    try {
      const id = req.params.id;
      await BookItem.findByIdAndDelete(id);

      return res.status(202).json({ message: "Réservation supprimé" });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      } else {
        return res.status(500).json({ message: error.message });
      }
    }
  }
);
router.delete(
  "/admin/deletprojectcustomer/:id",
  isAuthentificated,
  async (req, res) => {
    try {
      const id = req.params.id;
      const projectToDelete = await ProjectCustomer.findById(id);

      const picturesToDelete = projectToDelete.images;
      const arrayOfPromises = picturesToDelete.map((picture) => {
        return cloudinary.uploader.destroy(picture.public_id);
      });

      await Promise.all(arrayOfPromises);

      await cloudinary.api.delete_folder(`tatooShop/projectCustomer/${id}`);

      await ProjectCustomer.findByIdAndDelete(id);

      return res.status(202).json({ message: "Projet supprimé" });
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      } else {
        return res.status(500).json({ message: error.message });
      }
    }
  }
);
module.exports = router;
