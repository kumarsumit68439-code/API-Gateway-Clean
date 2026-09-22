import { NextResponse } from "next/server";
import { ALL_MODELS } from "@/lib/models";

export async function GET() {
  return NextResponse.json({
    data: ALL_MODELS.map((m) => ({
      id: m.id,
      label: m.label,
      provider: m.provider,
    })),
  });
}
