const mongoose = require("mongoose");
const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };
const ProjectCustomerSchema = mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    description: { type: String, require: true },
    images: [Object],
    archived: { type: Boolean, default: false },
    dateOfCreation: { type: Date, default: new Date() },
  },
  opts
);

const ProjectCustomer = mongoose.model(
  "ProjectCustomer",
  ProjectCustomerSchema
);
module.exports = ProjectCustomer;
