import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Template from "@/models/template";

// Define interface for defaultFields structure
interface DefaultField {
  value: string;
  mapping?: string;
}

// Define interface for the request body
interface TemplateRequestBody {
  title?: string;
  content?: string;
  defaultFields?: Record<string, DefaultField>;
  description?: string;
  metadata?: { category?: string };
  tags?: string[];
}

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = (await req.json()) as TemplateRequestBody;

    // Validate content
    if (body.content === undefined || body.content === null) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Validate defaultFields mappings
    if (body.defaultFields) {
      for (const [key, field] of Object.entries(body.defaultFields)) {
        if (
          field.mapping &&
          !/^[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/.test(field.mapping)
        ) {
          return NextResponse.json(
            {
              error: `Invalid mapping format for field "${key}". Expected "party.property".`,
            },
            { status: 400 }
          );
        }
      }
    }

    const template = await Template.create({
      title: body.title || "Untitled Template",
      content: body.content, // Use body.content directly, as it's validated
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
