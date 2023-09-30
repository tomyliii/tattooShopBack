const express = require("express");
const router = express.Router();
const Item = require("../Models/Item");
const isAuthentificated = require("../Middleware/isAuthentificated");
const cloudinary = require("cloudinary").v2;
const fileUpload = require("express-fileupload");
const convertToBase64 = require("../Tools/convertToBase64");
const Customer = require("../Models/Customer");
const BookItem = require("../Models/BookItem");
const Mailgun = require("mailgun.js");
const formData = require("form-data");

const mailgun = new Mailgun(formData);
const client = mailgun.client({
  username: process.env.USERNAME,
  key: process.env.MAILGUN_API_KEY,
});

router.post(
  "/tatoo/create",
  isAuthentificated,
  fileUpload(),
  async (req, res) => {
    try {
      const { name, description, keywords } = req.body;
      if ((name, description)) {
        const newItems = new Item({
          name,
          description,
          dateOfCreation: new Date(),
        });
        if (keywords) {
          newItems.keywords = keywords;
        }

        if (req.files?.images) {
          const arrayOfPictures = req.files.images;

          const picture = await cloudinary.uploader.upload(
            convertToBase64(arrayOfPictures),
            {
              folder: "/tatooShop/tatoo/" + newItems._id,
            }
          );

          const image = {
            public_id: picture.public_id,
            secure_url: picture.secure_url,
          };
          newItems.images.push(image);

          await newItems.save();
          return res.status(201).json({
            message: "Ajouté à votre base de données.",
            date: newItems,
          });
        } else {
          return res
            .status(422)
            .json({ message: "Information(s) manquantes(s)" });
        }
      } else {
        return res
          .status(422)
          .json({ message: "Information(s) manquantes(s)" });
      }
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ message: error.message });
      } else {
        return res.status(500).json({ message: error.message });
      }
    }
  }
);

router.get("/tatoo", async (req, res) => {
  try {
    let page = 1;
    if (req.query.page) {
      page = Number(req.query.page);
    }
    let limit = 20;
    if (req.query.limit) {
      limit = Number(req.query.limit);
    }

    let skip = limit * (page - 1);
    let sort = -1;
    if (req.query.sort) {
      sort = req.query.sort;
    }
    if (req.query.search) {
      const filter = new RegExp(req.query.search, "ig");
      const tatoos = await Item.find({
        $and: [
          {
            $or: [
              { name: filter },
              { description: filter },
              { keywords: filter },
            ],
          },
          { disable: true },
        ],
      })

        .skip(skip)
        .limit(limit)
        .sort({ dateOfCreation: sort });
      const count = await Item.count({
        $and: [
          {
            $or: [
              { name: filter },
              { description: filter },
              { keywords: filter },
            ],
          },
          { disable: true },
        ],
      });

      return res.status(200).json({ tatoos: tatoos, count: count });
    }

    const tatoos = await Item.find({ disable: true })
      .skip(skip)
      .limit(limit)
      .sort({ dateOfCreation: sort });
    const count = await Item.count({ disable: true });

    return res.status(200).json({ tatoos: tatoos, count: count });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});
router.get("/tatoo/all", isAuthentificated, async (req, res) => {
  try {
    let page = 1;
    if (req.query.page) {
      page = Number(req.query.page);
    }
    let limit = 20;
    if (req.query.limit) {
      limit = Number(req.query.limit);
    }

    let skip = limit * (page - 1);

    let sort = -1;
    if (req.query.sort) {
      sort = req.query.sort;
    }
    if (req.query.search) {
      const filter = new RegExp(req.query.search, "ig");
      const tatoos = await Item.find({
        $and: [
          {
            $or: [
              { name: filter },
              { description: filter },
              { keywords: filter },
            ],
          },
          { disable: true },
        ],
      })

        .skip(skip)
        .limit(limit)
        .sort({ dateOfCreation: sort });
      const count = await Item.count({
        $or: [{ name: filter }, { description: filter }, { keywords: filter }],
      });

      return res.status(200).json({ tatoos: tatoos, count: count });
    }

    const tatoos = await Item.find()
      .skip(skip)
      .limit(limit)
      .sort({ dateOfCreation: sort });
    const count = await Item.count();
    return res.status(200).json({ tatoos: tatoos, count: count });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

router.get("/tatoo/:id", async (req, res) => {
  try {
    const flash = await Item.findById(req.params.id);
    return res.status(200).json(flash);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

router.delete("/tatoo/delete/:id", isAuthentificated, async (req, res) => {
  try {
    const itemToDelet = await Item.findById(req.params.id);
    const picturesToDelete = itemToDelet.images;
    await BookItem.findOneAndDelete({ item: itemToDelet });
    const arrayOfPromises = picturesToDelete.map((picture) => {
      return cloudinary.uploader.destroy(picture.public_id);
    });

    await Promise.all(arrayOfPromises);
    await cloudinary.api.delete_folder(`tatooShop/tatoo/${req.params.id}`);

    await Item.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Supprimé." });
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

// router.put("/tatoo/deletepicture/:id", isAuthentificated, async (req, res) => {
//   try {
//     const { image } = req.body;
//     const { id } = req.params;

//     const itemToEdit = await Item.findById(id);
//     if (itemToEdit.images.length === 1) {
//       return res.status(403).json({
//         message:
//           "Impossible de supprimer votre image. Vous devez avoir au moin une image à presenter pour un flash.",
//       });
//     }
//     const index = itemToEdit.images.findIndex(
//       (imageToCheck) => imageToCheck.public_id === image.public_id
//     );

//     itemToEdit.images.splice(index, 1);
//     await cloudinary.uploader.destroy(image.public_id);
//     await itemToEdit.save();

//     res.status(200).json(itemToEdit);
//   } catch (error) {
//     if (error.status) {
//       return res.status(error.status).json({ message: error.message });
//     } else {
//       return res.status(500).json({ message: error.message });
//     }
//   }
// });

router.put("/tatoo/edit", isAuthentificated, fileUpload(), async (req, res) => {
  try {
    const { name, description, keywords, id, disable } = req.body;
    const itemToEdit = await Item.findById(id);

    if (disable) {
      itemToEdit.disable = disable;
    }
    if (name) {
      itemToEdit.name = name;
    }
    if (description) {
      itemToEdit.description = description;
    }
    if (keywords) {
      itemToEdit.keywords = keywords;
    }

    if (req.files?.imagesToAdd) {
      await cloudinary.uploader.destroy(itemToEdit.images[0].public_id);

      const response = await cloudinary.uploader.upload(
        convertToBase64(req.files.imagesToAdd),
        {
          folder: "/tatooShop/Admin/Avatar",
          public_id: "avatar_" + itemToEdit._id,
        }
      );
      itemToEdit.images[0].secure_url = response.secure_url;
      itemToEdit.images[0].public_id = response.public_id;
    }

    // if (req.files?.imagesToAdd) {
    //   const arrayOfPictures = req.files.imagesToAdd;

    //   if (itemToEdit.images.length === 3) {
    //     return res.status(403).json({
    //       message:
    //         "Impossible de rajouter votre image. Vous avez déjà atteint le nombre maxilmal d'images pour ce flash.",
    //     });
    //   }
    //   if (arrayOfPictures.length) {
    //     const arrayOfPromises = arrayOfPictures.map((picture) => {
    //       return cloudinary.uploader.upload(convertToBase64(picture), {
    //         folder: "/tatooShop/tatoo/" + itemToEdit._id,
    //       });
    //     });

    //     const pictures = await Promise.all(arrayOfPromises);

    //     pictures.forEach((picture) => {
    //       const image = {
    //         public_id: picture.public_id,
    //         secure_url: picture.secure_url,
    //       };

    //       itemToEdit.images.push(image);
    //     });
    //   } else {
    //     const picture = await cloudinary.uploader.upload(
    //       convertToBase64(arrayOfPictures),
    //       {
    //         folder: "/tatooShop/tatoo/" + itemToEdit._id,
    //       }
    //     );

    //     const image = {
    //       public_id: picture.public_id,
    //       secure_url: picture.secure_url,
    //     };
    //     itemToEdit.images.push(image);
    //   }
    // }

    await itemToEdit.save();

    res.status(200).json(itemToEdit);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      return res.status(500).json({ message: error.message });
    }
  }
});

router.post("/book/tatoo", async (req, res) => {
  try {
    const { firstname, lastname, number, newsLetter, message, id, mail } =
      req.body;

    const customer = await Customer.findOne({ mail: mail });
    const tattoo = await Item.findById(id);
    if (customer) {
      const newBookItem = new BookItem({
        customer: customer,
        item: tattoo,
        message: message,
        dateOfCreation: new Date(),
      });
      await newBookItem.save();
      return res.status(201).json({ message: "Demande valider." });
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
      const newBookItem = new BookItem({
        customer: newCustomer,
        item: tattoo,
        message: message,
        dateOfCreation: new Date(),
      });

      const messageData = {
        from: `${firstname} ${lastname} <${mail} >`,
        to: process.env.USER_MAIL,
        subject: `Réservation de tattoo`,
        text: message,
      };

      const responseMailGun = await client.messages.create(
        process.env.MAILGUN_DOMAIN,
        messageData
      );

      await newCustomer.save();
      await newBookItem.save();
      return res.status(201).json({ message: "Demande valider." });
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
