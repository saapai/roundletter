import { NextRequest, NextResponse } from "next/server";

// For /pitch: if the visitor arrives from a direct link (no referer, external
// referer, or a shared URL), grant access automatically. If they navigated
// here from within aureliex.com itself, require the password.
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname !== "/pitch") return NextResponse.next();

  // already has the cookie? let them through
  if (req.cookies.get("aureliex-pitch")?.value === "1") return NextResponse.next();

  const referer = req.headers.get("referer") ?? "";
  const fromOurSite =
    referer.includes("://aureliex.com") ||
    referer.includes("://www.aureliex.com") ||
    referer.includes("://roundletter-") && referer.includes(".vercel.app");

  if (!fromOurSite) {
    const res = NextResponse.next();
    res.cookies.set({
      name: "aureliex-pitch",
      value: "1",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 60,
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/pitch"],
};
