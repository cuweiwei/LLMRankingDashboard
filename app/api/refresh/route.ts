import { NextResponse } from "next/server";
import { loadDashboardSnapshot } from "@/lib/data";

export const dynamic = "force-static";

export async function GET() {
  const snapshot = loadDashboardSnapshot();
  return NextResponse.json({
    status: "fallback",
    message: "No stable unauthenticated Artificial Analysis feed is configured; local validated data remains active.",
    lastUpdated: snapshot.lastUpdated,
    dataSource: snapshot.dataSource,
  });
}
