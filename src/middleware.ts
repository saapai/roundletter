import { NextRequest, NextResponse } from "next/server";

const PERSONAL_HOSTS = ["saathvikpai.com", "www.saathvikpai.com"];

const SHAREHOLDER_SLUGS = new Set(["navya", "franco", "elijah", "yashas"]);

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const isPersonal = PERSONAL_HOSTS.some((h) => host === h || host.startsWith(`${h}:`));
  const pathname = req.nextUrl.pathname;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  if (isPersonal && (pathname === "/" || pathname === "")) {
    const url = req.nextUrl.clone();
    url.pathname = "/personal";
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  // saathvikpai.com/letters → personal-styled letters index
  if (isPersonal && pathname === "/letters") {
    const url = req.nextUrl.clone();
    url.pathname = "/personal-letters";
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  // /navya, /franco, /elijah, /yashas → shareholder page
  const slug = pathname.slice(1).toLowerCase();
  if (SHAREHOLDER_SLUGS.has(slug)) {
    const url = req.nextUrl.clone();
    url.pathname = `/shareholder/${slug}`;
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
