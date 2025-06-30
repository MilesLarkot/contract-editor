import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Template from "@/models/template";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const template = await Template.create({
      title: body.title || "Untitled Template",
      content: body.content || "",
      defaultFields: body.defaultFields || {},
      metadata: body.metadata || {},
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create template",
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  await connectDB();
  const templates = await Template.find({}).lean();
  return NextResponse.json(templates);
}
