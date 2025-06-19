import { NextResponse } from "next/server";
import Contract from "@/models/contract";

export async function GET(request: any, { params }: any) {
  const contract = await Contract.findById(params.id)
    .select("title content fields")
    .lean();
  if (!contract)
    return NextResponse.json({ error: "Contract Not found" }, { status: 404 });
  return NextResponse.json(contract);
}

export async function PUT(request: { json: () => any }, { params }: any) {
  const body = await request.json();
  const updated = await Contract.findByIdAndUpdate(params.id, body, {
    new: true,
  }).lean();
  if (!updated)
    return NextResponse.json({ error: "Contract Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function PATCH(request: { json: () => any }, { params }: any) {
  const body = await request.json();
  const updated = await Contract.findByIdAndUpdate(
    params.id,
    { $set: body },
    {
      new: true,
    }
  ).lean();
  if (!updated)
    return NextResponse.json({ error: "Contract Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: any, { params }: any) {
  const deleted = await Contract.findByIdAndDelete(params.id).lean();
  if (!deleted)
    return NextResponse.json({ error: "Contract Not found" }, { status: 404 });
  return NextResponse.json({ message: "Contract Deleted successfully" });
}
