import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

import { readTamagotchis, type TamagochiBindings } from "@/lib/tamagotchiStorage";

export const runtime = "edge";

export async function GET() {
  try {
    const bindings = getRequestContext().env as Partial<TamagochiBindings>;
    const tamagotchis = await readTamagotchis(bindings);
    return NextResponse.json({ tamagotchis });
  } catch (error) {
    console.error("Nem sikerült beolvasni a tamagochi listát", error);
    return NextResponse.json(
      { error: "Nem sikerült beolvasni a tamagochi társakat." },
      { status: 500 },
    );
  }
}
