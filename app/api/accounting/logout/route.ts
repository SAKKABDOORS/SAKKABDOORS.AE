import { NextResponse } from "next/server";
import { clearSystemSession } from "@/lib/systemAuth";

export async function POST() {
  clearSystemSession();
  return NextResponse.json({ ok: true });
}
