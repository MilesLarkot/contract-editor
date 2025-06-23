import mongoose, { Schema, Document } from "mongoose";

export interface ClauseDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  metadata: {
    createdBy?: mongoose.Types.ObjectId;
    category?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ClauseSchema = new Schema<ClauseDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    metadata: {
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      category: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Clause ||
  mongoose.model<ClauseDocument>("Clause", ClauseSchema);
