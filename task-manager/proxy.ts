import { NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
  // Минимальный proxy для Next.js 16
  // Защита роутов происходит на уровне страниц через auth() и redirect()
  return NextResponse.next();
}
