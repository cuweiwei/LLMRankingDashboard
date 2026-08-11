import { NextResponse } from "next/server";
import { loadDashboardSnapshot } from "@/lib/data";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(loadDashboardSnapshot(), {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=86400" },
  });
}
