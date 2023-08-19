const mongoose = require("mongoose");
const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };

const ItemSchema = mongoose.Schema(
  {
    name: { type: String, require: true },
    description: { type: String, require: true },
    images: [Object],
    keywords: String,
    disable: { type: Boolean, default: true },
    dateOfCreation: { type: Date, default: new Date() },
  },
  opts
);

const Item = mongoose.model("Item", ItemSchema);
module.exports = Item;
