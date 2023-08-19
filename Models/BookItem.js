const mongoose = require("mongoose");
const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };
const BookItemSchema = mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
    message: String,
    archived: { type: Boolean, default: false },
    dateOfCreation: { type: Date, default: new Date() },
  },
  opts
);

const BookItem = mongoose.model("BookItem", BookItemSchema);
module.exports = BookItem;
