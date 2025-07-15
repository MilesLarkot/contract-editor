import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Contract from "@/models/contract";

interface LeanContract {
  _id: string;
  title: string;
  content: string;
  fields: Record<string, string>;
  updatedAt?: Date;
  __v?: number;
}

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
      updatedAt: contract.updatedAt,
    });
  } catch (err) {
    console.error("POST /api/contracts failed:", err);
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
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
      filter.title = { $regex: query, $options: "i" };
    }

    const contracts = (await Contract.find(filter)
      .select("title content fields updatedAt")
      .lean()) as LeanContract[];
    return NextResponse.json(
      contracts.map((contract) => ({
        _id: contract._id,
        title: contract.title,
        content: contract.content,
        fields: contract.fields,
        updatedAt: contract.updatedAt
          ? new Date(contract.updatedAt).toISOString()
          : "",
      }))
    );
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}
