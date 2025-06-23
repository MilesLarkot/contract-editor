import connectDB from "@/lib/db";
import Clause from "@/models/clause";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const clause = await Clause.create({
      title: body.title || "Untitled Clause",
      content: body.content || "",
      metadata: {
        createdBy: body.metadata?.createdBy,
        category: body.metadata?.category,
      },
    });

    return NextResponse.json({
      id: clause._id.toString(),
      title: clause.title,
      content: clause.content,
      metadata: clause.metadata,
    });
  } catch (err) {
    console.error("POST /api/clauses failed:", err);
    return NextResponse.json(
      { error: "Failed to create clause" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();
    const clauses = await Clause.find({}).lean();
    return NextResponse.json(clauses);
  } catch (err) {
    console.error("GET /api/clauses failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch clauses" },
      { status: 500 }
    );
  }
}
