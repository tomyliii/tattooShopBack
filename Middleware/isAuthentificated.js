const mongoose = require("mongoose");

const Admin = require("../Models/Admin");

const isAuthentificated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const sentToken = req.headers.authorization.replace("Bearer ", "");
      const findAdmin = await Admin.findOne({ token: sentToken }).select(
        "-salt -hash"
      );
      if (findAdmin) {
        req.findAdmin = findAdmin;
        return next();
      } else {
        return res.status(401).json({ message: "Non autorisé." });
      }
    } else {
      return res.status(401).json({ message: "Non autorisé." });
    }
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Erreur de serveur." });
    }
  }
};

module.exports = isAuthentificated;
