import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname, search } = request.nextUrl;

  if (pathname === "/shop/") {
    const url = request.nextUrl.clone();
    url.pathname = "/shop";
    url.search = search;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/shop/"],
};
