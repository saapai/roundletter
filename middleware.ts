import { NextRequest, NextResponse } from "next/server";

const PERSONAL_HOSTS = ["saathvikpai.com", "www.saathvikpai.com"];

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const isPersonal = PERSONAL_HOSTS.some((h) => host === h || host.startsWith(`${h}:`));

  if (!isPersonal) return NextResponse.next();

  const url = req.nextUrl.clone();
  if (url.pathname === "/" || url.pathname === "") {
    url.pathname = "/statement";
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
