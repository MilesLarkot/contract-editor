import mongoose, { Schema, Document } from "mongoose";

export interface ContractDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  fields: Map<string, string>;
  templateId?: mongoose.Types.ObjectId | null;
  metadata: {
    createdBy?: mongoose.Types.ObjectId;
  };
  versionHistory: { content: string; updatedAt: Date }[];
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<ContractDocument>(
  {
    title: { type: String, required: true },
    content: { type: String, required: false, default: "" },
    fields: {
      type: Map,
      of: String,
      default: {},
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: "Template",
      default: null,
    },
    metadata: {
      createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    versionHistory: [
      {
        content: String,
        updatedAt: Date,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Contract ||
  mongoose.model<ContractDocument>("Contract", ContractSchema);
