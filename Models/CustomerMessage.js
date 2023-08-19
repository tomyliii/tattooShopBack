const mongoose = require("mongoose");
const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };
const CustomerMessageSchema = mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    message: { type: String, require: true },
    archived: { type: Boolean, default: false },
    dateOfCreation: { type: Date, default: new Date() },
  },
  opts
);

const CustomerMessage = mongoose.model(
  "CustomerMessage",
  CustomerMessageSchema
);
module.exports = CustomerMessage;
