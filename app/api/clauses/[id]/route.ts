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

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    const body = await req.json();

    const clause = await Clause.findByIdAndUpdate(
      id,
      {
        title: body.title,
        content: body.content,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!clause) {
      return NextResponse.json({ error: "Clause not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: clause._id.toString(),
      title: clause.title,
      content: clause.content,
      metadata: clause.metadata,
    });
  } catch (err) {
    console.error(`PUT /api/clauses/${params.id} failed:`, err);
    return NextResponse.json(
      { error: "Failed to update clause" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    const clause = await Clause.findByIdAndDelete(id);

    if (!clause) {
      return NextResponse.json({ error: "Clause not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Clause deleted successfully" });
  } catch (err) {
    console.error(`DELETE /api/clauses/${params.id} failed:`, err);
    return NextResponse.json(
      { error: "Failed to delete clause" },
      { status: 500 }
    );
  }
}
