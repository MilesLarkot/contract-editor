import mongoose from "mongoose";

const TemplateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    defaultFields: {
      type: Map,
      of: String,
      default: {},
    },
    metadata: {
      category: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Template ||
  mongoose.model("Template", TemplateSchema);
