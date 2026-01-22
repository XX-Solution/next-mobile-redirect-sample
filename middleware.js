import { NextResponse } from 'next/server';

// NOTE:
// Distinguishing a *real* phone from DevTools device emulation is NOT reliable on the server.
// Chrome DevTools can override User-Agent and even some Client Hints.
//
// Therefore this sample now uses a **client-side** redirect (see app/components/RealMobileRedirect.js),
// which checks UA-CH high-entropy signals (platform/wow64/arch) when available.
//
// Middleware is kept for:
// - manual toggles (?desktop=1 / ?mobile=1)
// - preventing redirect loops when running the same app on multiple hosts

const MOBILE_HOST = (process.env.MOBILE_HOST || 'm.example.com').toLowerCase();

function isLocalhost(host = '') {
  return host.startsWith('localhost') || host.startsWith('127.0.0.1');
}

export function middleware(req) {
  const url = req.nextUrl.clone();
  const host = (req.headers.get('host') || '').toLowerCase();

  // Avoid redirect loops: if this same app is deployed on the mobile host too, do nothing.
  if (host === MOBILE_HOST) return NextResponse.next();

  // In development on localhost, do nothing (easier to test).
  // You can still test by setting HOST in your hosts file and using a local proxy.
  if (isLocalhost(host)) return NextResponse.next();

  // Manual toggles:
  // ?desktop=1 -> set cookie prefer_desktop=1
  // ?mobile=1  -> remove cookie
  if (url.searchParams.get('desktop') === '1') {
    url.searchParams.delete('desktop');
    const res = NextResponse.redirect(url);
    res.cookies.set('prefer_desktop', '1', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365
    });
    return res;
  }

  if (url.searchParams.get('mobile') === '1') {
    url.searchParams.delete('mobile');
    const res = NextResponse.redirect(url);
    res.cookies.delete('prefer_desktop', { path: '/' });
    return res;
  }

  // If user/device is pinned to desktop -> client redirect won't happen
  const preferDesktop = req.cookies.get('prefer_desktop')?.value === '1';
  if (preferDesktop) return NextResponse.next();

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'
  ]
};
