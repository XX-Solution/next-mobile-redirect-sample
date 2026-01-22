'use client';

import { useEffect } from 'react';

// Full URL to your mobile site (different domain is fine)
// Example: https://m.example.com
const MOBILE_URL = process.env.NEXT_PUBLIC_MOBILE_URL || '';

function hasCookie(name) {
  if (typeof document === 'undefined') return false;
  return document.cookie.split(';').some((c) => c.trim().startsWith(`${name}=`));
}

function isDesktopPlatformName(p = '') {
  const v = String(p).toLowerCase();
  return v.includes('win') || v.includes('mac') || v.includes('linux') || v.includes('cros');
}

function looksLikeX86(arch = '') {
  const a = String(arch).toLowerCase();
  return a.includes('x86') || a.includes('amd64') || a.includes('x64');
}

function isMobileUAString(ua = '') {
  return /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(ua);
}

async function detectRealMobile() {
  // 1) Hard opt-out
  if (hasCookie('prefer_desktop')) return { realMobile: false, reason: 'prefer_desktop cookie' };

  // 2) Memory exception (if available)
  const mem = typeof navigator !== 'undefined' ? navigator.deviceMemory : undefined;
  if (typeof mem === 'number' && mem > 10) {
    return { realMobile: false, reason: `deviceMemory=${mem} (>10)` };
  }

  // 3) UA-CH (best effort in Chromium)
  const uaData = typeof navigator !== 'undefined' ? navigator.userAgentData : undefined;
  if (uaData) {
    const lowMobile = !!uaData.mobile;
    const lowPlatform = uaData.platform || '';

    let hi = {};
    try {
      hi = await uaData.getHighEntropyValues(['platform', 'architecture', 'bitness', 'wow64', 'model']);
    } catch {
      hi = {};
    }

    const platform = hi.platform || lowPlatform || '';
    const arch = hi.architecture || '';
    const wow64 = hi.wow64 === true;

    // If platform/arch screams desktop -> it's not a real phone (even if UA was overridden).
    if (isDesktopPlatformName(platform) || looksLikeX86(arch) || wow64) {
      return { realMobile: false, reason: `desktop-like UA-CH (platform=${platform}, arch=${arch}, wow64=${wow64})` };
    }

    // Real mobile for our purposes: UA-CH says mobile, and it's not desktop-like.
    return { realMobile: lowMobile, reason: `uaData.mobile=${lowMobile}, platform=${platform}` };
  }

  // 4) Fallback (Safari / older browsers): UA string + navigator.platform
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const platform = typeof navigator !== 'undefined' ? navigator.platform : '';

  // If platform indicates desktop OS, do NOT redirect (covers many desktop emulation cases).
  if (isDesktopPlatformName(platform)) {
    return { realMobile: false, reason: `platform=${platform}` };
  }

  return { realMobile: isMobileUAString(ua), reason: 'UA fallback' };
}

export default function RealMobileRedirect() {
  useEffect(() => {
    if (!MOBILE_URL) return;

    // Don't run on the mobile site itself.
    // (Useful if you re-use this component across hosts accidentally.)
    try {
      const mobileHost = new URL(MOBILE_URL).host;
      if (window.location.host === mobileHost) return;
    } catch {
      // ignore invalid URL
      return;
    }

    let cancelled = false;

    (async () => {
      const res = await detectRealMobile();
      if (cancelled) return;

      if (!res.realMobile) return;

      // Preserve path, query, hash
      const target = new URL(MOBILE_URL);
      target.pathname = window.location.pathname;
      target.search = window.location.search;
      target.hash = window.location.hash;

      window.location.replace(target.toString());
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
