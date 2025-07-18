import { NextRequest, NextResponse } from "next/server";
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
  tags?: string[];
}

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const template = await Template.findById(params.id)
    .select(
      "title content defaultFields metadata.description metadata.tags updatedAt"
    )
    .lean();
  if (!template)
    return NextResponse.json({ error: "Template Not found" }, { status: 404 });
  return NextResponse.json({
    id: template._id,
    title: template.title,
    content: template.content,
    defaultFields: template.defaultFields,
    description: template.metadata?.description || "",
    tags: template.metadata?.tags || [],
    updatedAt: template.updatedAt
      ? new Date(template.updatedAt).toISOString()
      : "",
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  const body = (await request.json()) as TemplateRequestBody;

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

  const updateData = {
    title: body.title,
    content: body.content,
    defaultFields: body.defaultFields,
    "metadata.description": body.description,
    "metadata.tags": body.tags,
  };
  const updated = await Template.findByIdAndUpdate(
    params.id,
    { $set: updateData },
    {
      new: true,
    }
  )
    .select(
      "title content defaultFields metadata.description metadata.tags updatedAt"
    )
    .lean();
  if (!updated)
    return NextResponse.json({ error: "Template Not found" }, { status: 404 });
  return NextResponse.json({
    id: updated._id,
    title: updated.title,
    content: updated.content,
    defaultFields: updated.defaultFields,
    description: updated.metadata?.description || "",
    tags: updated.metadata?.tags || [],
    updatedAt: updated.updatedAt
      ? new Date(updated.updatedAt).toISOString()
      : "",
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  const deleted = await Template.findByIdAndDelete(params.id).lean();
  if (!deleted)
    return NextResponse.json({ error: "Template Not found" }, { status: 404 });
  return NextResponse.json({ message: "Template Deleted successfully" });
}
