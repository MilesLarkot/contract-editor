import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Template from "@/models/template";

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const template = await Template.create(body);
  return NextResponse.json(template);
}

export async function GET() {
  await connectDB();
  const templates = await Template.find({}).lean();
  return NextResponse.json(templates);
}
