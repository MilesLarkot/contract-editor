import mongoose from "mongoose";

export interface TemplateDocument extends mongoose.Document {
  title: string;
  content: string;
  defaultFields: Record<string, string>;
  metadata?: {
    category?: string;
  };
}

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

export default (mongoose.models.Template as mongoose.Model<TemplateDocument>) ||
  mongoose.model<TemplateDocument>("Template", TemplateSchema);
