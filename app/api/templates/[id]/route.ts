import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Template from "@/models/template";

export async function GET(_: Request, { params }: any) {
  await connectDB();
  const template = await Template.findById(params.id);
  return NextResponse.json(template);
}

export async function PATCH(req: Request, { params }: any) {
  await connectDB();
  const body = await req.json();
  const updated = await Template.findByIdAndUpdate(params.id, body, {
    new: true,
  });
  return NextResponse.json(updated);
}
