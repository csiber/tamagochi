import { NextResponse } from "next/server";

import { readTamagotchis } from "@/lib/tamagotchiStorage";

export const runtime = "edge";

export async function GET() {
  try {
    const tamagotchis = await readTamagotchis();
    return NextResponse.json({ tamagotchis });
  } catch (error) {
    console.error("Nem sikerült beolvasni a tamagochi listát", error);
    return NextResponse.json(
      { error: "Nem sikerült beolvasni a tamagochi társakat." },
      { status: 500 },
    );
  }
}
