const mongoose = require("mongoose");
const TextDescriptionSchema = mongoose.Schema({ description: String });
const TextDescription = mongoose.model(
  "TextDescription",
  TextDescriptionSchema
);
module.exports = TextDescription;
