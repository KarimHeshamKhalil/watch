import { type NextRequest, NextResponse } from "next/server";
import { searchMulti } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 2) return NextResponse.json([]);
  const results = await searchMulti(q);
  return NextResponse.json(results.slice(0, 8));
}
