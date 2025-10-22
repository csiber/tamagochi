import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const NAME_COOKIE = "tamagochi-name";
const MAX_NAME_LENGTH = 24;

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const storedName = request.cookies.get(NAME_COOKIE)?.value ?? null;

  return NextResponse.json({ name: storedName });
}

export async function POST(request: NextRequest) {
  let parsedBody: unknown;

  try {
    parsedBody = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Hibás kérés: nem sikerült elolvasni a nevet." },
      { status: 400 }
    );
  }

  const rawName =
    typeof (parsedBody as { name?: unknown }).name === "string"
      ? (parsedBody as { name?: string }).name.trim()
      : "";

  if (!rawName) {
    return NextResponse.json(
      { error: "Adj meg egy nevet, hogy elmentsük a sessionbe!" },
      { status: 400 }
    );
  }

  if (rawName.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      {
        error: `A név legyen legfeljebb ${MAX_NAME_LENGTH} karakter hosszú!`,
      },
      { status: 400 }
    );
  }

  const response = NextResponse.json({ name: rawName });

  response.cookies.set({
    name: NAME_COOKIE,
    value: rawName,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 nap
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ name: null });

  response.cookies.set({
    name: NAME_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
