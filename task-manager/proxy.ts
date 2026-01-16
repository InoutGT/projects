import { NextRequest, NextResponse } from "next/server";

// Completely disabled proxy - no-op middleware
// All route protection is handled at page level via auth() and redirect()
export default function proxy(_request: NextRequest) {
  return NextResponse.next();
}

// Empty matcher ensures proxy never runs - effectively disables it
export const config = {
  matcher: [],
};
