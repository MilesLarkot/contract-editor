import { NextRequest, NextResponse } from "next/server";
import Template from "@/models/template";

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const template = await Template.findById(params.id)
    .select("title content fields")
    .lean();
  if (!template)
    return NextResponse.json({ error: "Template Not found" }, { status: 404 });
  return NextResponse.json(template);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  const body = await request.json();
  const updated = await Template.findByIdAndUpdate(
    params.id,
    { $set: body },
    {
      new: true,
    }
  ).lean();
  if (!updated)
    return NextResponse.json({ error: "Template Not found" }, { status: 404 });
  return NextResponse.json(updated);
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
