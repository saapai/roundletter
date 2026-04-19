import { NextRequest, NextResponse } from "next/server";

const PERSONAL_HOSTS: string[] = [];

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  if (pathname === "/" || pathname === "") {
    const url = req.nextUrl.clone();
    url.pathname = "/statement";
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
