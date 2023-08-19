const mongoose = require("mongoose");
const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };
const CustomerSchema = mongoose.Schema(
  {
    firstname: { type: String, require: true },
    lastname: { type: String, require: true },
    mail: { type: String, require: true },
    newsLetter: { type: Boolean, default: false },
    phoneNumber: Number,
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

const Customer = mongoose.model("Customer", CustomerSchema);

module.exports = Customer;
