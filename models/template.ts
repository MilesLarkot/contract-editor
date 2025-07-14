import mongoose from "mongoose";

export interface TemplateDocument extends mongoose.Document {
  _id: mongoose.Schema.Types.ObjectId;
  title: string;
  content: string;
  defaultFields: Record<string, string>;
  metadata?: {
    category?: string;
    description?: string;
    tags?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new mongoose.Schema<TemplateDocument>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    defaultFields: {
      type: mongoose.Schema.Types.Map,
      of: String,
      default: {},
    },
    metadata: {
      category: { type: String },
      description: { type: String },
      tags: [{ type: String }],
    },
  },
  { timestamps: true }
);

export default (mongoose.models.Template as mongoose.Model<TemplateDocument>) ||
  mongoose.model<TemplateDocument>("Template", TemplateSchema);
