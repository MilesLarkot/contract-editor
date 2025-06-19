import mongoose from "mongoose";

let isConnected = false;

export default async function connectDB() {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set");

  try {
    await mongoose.connect(uri);
    isConnected = true;
  } catch (err) {
    throw err;
  }
}
