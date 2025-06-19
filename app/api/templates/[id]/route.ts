import { NextResponse } from "next/server";
import Template from "@/models/template";

export async function GET(request: any, { params }: any) {
  const template = await Template.findById(params.id)
    .select("title content fields")
    .lean();
  if (!template)
    return NextResponse.json({ error: "Template Not found" }, { status: 404 });
  return NextResponse.json(template);
}

export async function PATCH(request: { json: () => any }, { params }: any) {
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
  console.log("updated:", updated);
  return NextResponse.json(updated);
}

export async function DELETE(request: any, { params }: any) {
  const deleted = await Template.findByIdAndDelete(params.id).lean();
  if (!deleted)
    return NextResponse.json({ error: "Tempalte Not found" }, { status: 404 });
  return NextResponse.json({ message: "Template Deleted successfully" });
}
