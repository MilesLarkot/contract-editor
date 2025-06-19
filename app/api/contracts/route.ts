import connectDB from "@/lib/db";
import Contract from "@/models/contract";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const contract = await Contract.create({
      title: body.title || "Untitled Contract",
      content: body.content || "",
      fields: body.fields || {},
      metadata: {},
    });

    return NextResponse.json({
      id: contract._id.toString(),
      title: contract.title,
      content: contract.content,
      fields: contract.fields,
    });
  } catch (err) {
    console.error("POST /api/contracts failed:", err);
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    );
  }
}

export async function GET() {
  await connectDB();
  const contracts = await Contract.find({}).lean();
  return NextResponse.json(contracts);
}
