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
        tags: body.tags || [],
      },
    });
    return NextResponse.json(
      {
        id: template._id,
        title: template.title,
        content: template.content,
        defaultFields: template.defaultFields,
        description: template.metadata?.description || "",
        tags: template.metadata?.tags || [],
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

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    const filter: Record<string, unknown> = {};
    if (query) {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: escapedQuery, $options: "i" } },
        { "metadata.description": { $regex: escapedQuery, $options: "i" } },
        { "metadata.tags": { $regex: escapedQuery, $options: "i" } },
      ];
    }

    const templates = await Template.find(filter)
      .select(
        "title content defaultFields metadata.description metadata.tags updatedAt"
      )
      .lean();
    return NextResponse.json(
      templates.map((template) => ({
        id: template._id,
        title: template.title,
        content: template.content,
        defaultFields: template.defaultFields,
        description: template.metadata?.description || "",
        tags: template.metadata?.tags || [],
        updatedAt: template.updatedAt
          ? new Date(template.updatedAt).toISOString()
          : "",
      }))
    );
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
