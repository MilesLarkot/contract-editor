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
      metadata: {
        description: body.description || "",
        category: body.metadata?.category || "",
        tags: body.metadata?.tags || [],
      },
    });
    return NextResponse.json(
      {
        id: template._id,
        title: template.title,
        content: template.content,
        defaultFields: template.defaultFields,
        description: template.metadata?.description || "",
        updatedAt: template.updatedAt,
      },
      { status: 201 }
    );
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
  const templates = await Template.find({})
    .select("title content defaultFields metadata.description updatedAt")
    .lean();
  return NextResponse.json(
    templates.map((template) => ({
      id: template._id,
      title: template.title,
      content: template.content,
      defaultFields: template.defaultFields,
      description: template.metadata?.description || "",
      updatedAt: template.updatedAt
        ? new Date(template.updatedAt).toISOString()
        : "",
    }))
  );
}
