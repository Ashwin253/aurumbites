import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/data")) {
    const token = request.cookies.get("sb-access-token")?.value;
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = ""; // clear search params for login
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/shop/") {
    const url = request.nextUrl.clone();
    url.pathname = "/shop";
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/shop/", "/data/:path*"],
};
