# Next.js sample: redirect mobile users to a mobile domain (with exceptions)

This is a minimal **App Router** Next.js project (JavaScript, no TypeScript) that demonstrates a
**"real mobile only"** redirect to a separate mobile domain.

Why not a pure middleware redirect?

- On the server you only reliably have **User-Agent** and a few optional **Client Hints**.
- In DevTools device emulation, Chrome can spoof those — so "UA-based redirect" will also
  redirect your desktop browser.

So this sample uses a **client-side redirect** (best-effort) that checks UA-CH *high entropy* values
(`platform`, `wow64`, `architecture`) when available and avoids redirecting desktops in emulation.

Middleware is still used for:
- manual toggles `?desktop=1` / `?mobile=1`
- avoiding loops if you deploy the same app on the mobile host too

## 1) Install & run

```bash
npm i
npm run dev
```

## 2) Configure domains (production)

Copy `.env.example` to `.env.local` and set your domains:

```bash
MOBILE_HOST=m.example.com
NEXT_PUBLIC_MOBILE_URL=https://m.example.com
```

> Note: In dev on `localhost` the redirect will still work (because it's client-side),
> but you need a real mobile device to see it happen.

## 3) Manual toggles

- `?desktop=1` sets cookie `prefer_desktop=1` and keeps the user on the desktop domain
- `?mobile=1` clears the cookie and allows redirect again

## 4) About GPU / RAM detection

- Middleware **cannot** reliably detect GPU.
- Client component `app/components/PreferDesktopGate.js` checks `navigator.deviceMemory` and WebGL renderer and pins desktop by cookie.

## 5) The actual mobile redirect logic

See `app/components/RealMobileRedirect.js`.

Rules:
- redirects only when the browser looks like a *real* phone/tablet
- does NOT redirect when UA-CH indicates desktop (`platform=Windows`, `wow64=true`, `architecture=x86`, etc.)
- does NOT redirect when `navigator.deviceMemory > 10`

Adjust heuristics for your needs.
