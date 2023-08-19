const mongoose = require("mongoose");
const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };
const AdminSchema = mongoose.Schema(
  {
    firstname: { type: String, require: true },
    lastname: { type: String, require: true },
    mail: { type: String, require: true },
    salt: { type: String, require: true },
    hash: { type: String, require: true },
    token: { type: String, require: true },
    phoneNumber: Number,
    avatar: { secure_url: { type: String }, public_id: { type: String } },
    dateOfCreation: { type: Date, default: new Date() },
  },
  {
    virtuals: {
      fullName: {
        get() {
          return this.firstname + " " + this.lastname;
        },
      },
    },
  },
  opts
);

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
