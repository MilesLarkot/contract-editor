import { NextRequest, NextResponse } from "next/server";
import Contract from "@/models/contract";

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const contract = await Contract.findById(params.id)
    .select("title content fields")
    .lean();
  if (!contract)
    return NextResponse.json({ error: "Contract Not found" }, { status: 404 });
  return NextResponse.json(contract);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  const body = await request.json();
  const updated = await Contract.findByIdAndUpdate(params.id, body, {
    new: true,
  }).lean();
  if (!updated)
    return NextResponse.json({ error: "Contract Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  const deleted = await Contract.findByIdAndDelete(params.id).lean();
  if (!deleted)
    return NextResponse.json({ error: "Contract Not found" }, { status: 404 });
  return NextResponse.json({ message: "Contract Deleted successfully" });
}
