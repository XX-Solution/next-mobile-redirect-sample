'use client';

import { useEffect, useMemo, useState } from 'react';

const MOBILE_ORIGIN = process.env.NEXT_PUBLIC_MOBILE_ORIGIN;
const DEBUG = process.env.NEXT_PUBLIC_REDIRECT_DEBUG === '1';

// --- helpers ---
function getUA() {
  try {
    return navigator.userAgent || '';
  } catch {
    return '';
  }
}

function getUAD() {
  try {
    return navigator.userAgentData || null;
  } catch {
    return null;
  }
}

function isYandexBrowser(ua) {
  return /YandexBrowserCorp|YaBrowser|YandexBrowser/i.test(ua);
}

function isLikelyMobileByUA(ua) {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

function getPlatform(uad) {
  if (uad && typeof uad.platform === 'string' && uad.platform) return uad.platform;
  return navigator.platform || '';
}

function isProbablyIPad(ua, platform) {
  // iPadOS 13+ часто маскируется под macOS: "Macintosh" + touch + "Mobile" в UA
  const plat = String(platform || '');
  const isMacLike = /Mac/i.test(plat) || /Macintosh/i.test(ua);
  const hasTouch = (navigator.maxTouchPoints || 0) > 1;
  const hasMobileToken = /Mobile/i.test(ua);
  return isMacLike && hasTouch && hasMobileToken;
}

function isDesktopPlatform(platform, ua) {
  const p = String(platform).toLowerCase();

  // iPadOS может выглядеть как macOS — исключаем
  if (isProbablyIPad(ua, platform)) return false;

  const looksDesktop =
    p.includes('win') ||
    p.includes('mac') ||
    p.includes('darwin') ||
    p.includes('cros') ||
    // linux оставляем, но аккуратно — Android иногда пишет linux в platform
    p === 'linux' || p.includes('x11');

  // Явные мобильные по UA — не десктоп
  if (/android/i.test(ua) || /iphone|ipad|ipod/i.test(ua)) return false;

  // Если platform явно Android/iOS — не десктоп
  if (p.includes('android') || p.includes('ios')) return false;

  return looksDesktop;
}

function isMobileLike(uad, ua, platform) {
  // UA-CH если доступно
  if (uad && typeof uad.mobile === 'boolean') return uad.mobile;

  // iPadOS-эвристика
  if (isProbablyIPad(ua, platform)) return true;

  // UA эвристика
  if (isLikelyMobileByUA(ua)) return true;

  // Touch + маленький экран — резервный вариант (редко нужен)
  const touch = (navigator.maxTouchPoints || 0) > 1;
  const w = (window.screen && window.screen.width) ? window.screen.width : 0;
  const h = (window.screen && window.screen.height) ? window.screen.height : 0;
  const minSide = Math.min(w, h);

  return touch && minSide > 0 && minSide <= 900;
}

function getWebGLRenderer() {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return '';
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    if (!dbg) return '';
    const renderer = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
    return String(renderer || '');
  } catch {
    return '';
  }
}

function looksLikeDesktopGPU(renderer) {
  // Эвристика: дискретные/настольные линейки
  // (можешь дополнять под свои кейсы)
  return /NVIDIA|GeForce|RTX|GTX|Quadro|AMD|Radeon|RX\s?\d+|Intel\(R\)\s?Arc/i.test(renderer);
}

function getQueryParam(name) {
  try {
    return new URLSearchParams(window.location.search).get(name);
  } catch {
    return null;
  }
}

function setCookie(name, value, maxAgeSeconds = 60 * 60 * 24 * 365) {
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function deleteCookie(name) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function hasCookie(name, value) {
  return document.cookie.split(';').some((c) => c.trim() === `${name}=${value}`);
}

function redirectToMobile() {
  if (!MOBILE_ORIGIN) return false;

  // Защита от дубля: если уже на mobile-origin — не редиректим
  try {
    if (window.location.origin === MOBILE_ORIGIN) return false;
  } catch {}

  const { pathname, search, hash } = window.location;
  const target = `${MOBILE_ORIGIN}${pathname}${search}${hash}`;
  window.location.replace(target);
  return true;
}

export default function DomainRedirectGate() {
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const ua = getUA();
    const uad = getUAD();
    const platform = getPlatform(uad);

    const reasons = [];
    let decision = 'keep_desktop';

    // --- env check ---
    if (!MOBILE_ORIGIN) {
      reasons.push('MOBILE_ORIGIN not set (NEXT_PUBLIC_MOBILE_ORIGIN)');
      decision = 'keep_desktop';
      if (DEBUG) setDebugInfo({ decision, reasons, ua, platform, mem: navigator.deviceMemory ?? null, renderer: null, uad });
      return;
    }

    // --- ручные переключатели ---
    const desktopParam = getQueryParam('desktop');
    const mobileParam = getQueryParam('mobile');

    if (desktopParam === '1') {
      setCookie('prefer_desktop', '1');
      const url = new URL(window.location.href);
      url.searchParams.delete('desktop');
      window.history.replaceState({}, '', url.toString());
      reasons.push('query desktop=1 => set prefer_desktop cookie');
      decision = 'keep_desktop';
      if (DEBUG) setDebugInfo({ decision, reasons, ua, platform, mem: navigator.deviceMemory ?? null, renderer: null, uad });
      return;
    }

    if (mobileParam === '1') {
      deleteCookie('prefer_desktop');
      const url = new URL(window.location.href);
      url.searchParams.delete('mobile');
      window.history.replaceState({}, '', url.toString());
      reasons.push('query mobile=1 => clear prefer_desktop cookie and redirect');
      decision = 'redirect_mobile';
      const did = redirectToMobile();
      if (DEBUG) setDebugInfo({ decision: did ? decision : 'keep_desktop', reasons, ua, platform, mem: navigator.deviceMemory ?? null, renderer: null, uad });
      return;
    }

    // --- закрепление ПК ---
    if (hasCookie('prefer_desktop', '1')) {
      reasons.push('cookie prefer_desktop=1');
      decision = 'keep_desktop';
      if (DEBUG) setDebugInfo({ decision, reasons, ua, platform, mem: navigator.deviceMemory ?? null, renderer: null, uad });
      return;
    }

    // --- Яндекс.Браузер всегда ПК ---
    if (isYandexBrowser(ua)) {
      reasons.push('YandexBrowser detected => keep desktop');
      decision = 'keep_desktop';
      if (DEBUG) setDebugInfo({ decision, reasons, ua, platform, mem: navigator.deviceMemory ?? null, renderer: null, uad });
      return;
    }

    // --- любой десктоп (включая DevTools device toolbar) ---
    if (isDesktopPlatform(platform, ua)) {
      reasons.push(`desktop platform detected (${platform}) => keep desktop`);
      decision = 'keep_desktop';
      if (DEBUG) setDebugInfo({ decision, reasons, ua, platform, mem: navigator.deviceMemory ?? null, renderer: null, uad });
      return;
    }

    // --- далее: мобильное/планшет ---
    const mobileLike = isMobileLike(uad, ua, platform);
    if (!mobileLike) {
      reasons.push('not mobile-like => keep desktop');
      decision = 'keep_desktop';
      if (DEBUG) setDebugInfo({ decision, reasons, ua, platform, mem: navigator.deviceMemory ?? null, renderer: null, uad });
      return;
    }

    // --- исключение: мощная мобилка + десктопная GPU ---
    const mem = typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null;
    const isHighMem = typeof mem === 'number' && mem > 10;

    let renderer = null;
    let desktopGpu = false;
    if (isHighMem) {
      renderer = getWebGLRenderer();
      desktopGpu = looksLikeDesktopGPU(renderer);
    }

    if (isHighMem && desktopGpu) {
      reasons.push(`mobile but deviceMemory=${mem}>10 and desktop GPU => keep desktop`);
      decision = 'keep_desktop';
      if (DEBUG) setDebugInfo({ decision, reasons, ua, platform, mem, renderer, uad });
      return;
    }

    // --- иначе редирект ---
    reasons.push('real mobile (no desktop exceptions) => redirect to mobile origin');
    decision = 'redirect_mobile';
    const didRedirect = redirectToMobile();

    if (DEBUG) setDebugInfo({ decision: didRedirect ? decision : 'keep_desktop', reasons, ua, platform, mem, renderer, uad });
  }, []);

  if (!DEBUG || !debugInfo) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 12,
      right: 12,
      zIndex: 9999,
      width: 360,
      maxWidth: 'calc(100vw - 24px)',
      background: 'rgba(0,0,0,0.85)',
      color: 'white',
      padding: 12,
      borderRadius: 12,
      fontSize: 12,
      lineHeight: 1.35,
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>
        Redirect debug: {debugInfo.decision}
      </div>
      <div style={{ opacity: 0.9, marginBottom: 8 }}>
        <div><b>platform:</b> {String(debugInfo.platform)}</div>
        <div><b>deviceMemory:</b> {String(debugInfo.mem)}</div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <b>reasons:</b>
        <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
          {debugInfo.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
      <details style={{ opacity: 0.85 }}>
        <summary style={{ cursor: 'pointer' }}>UA</summary>
        <div style={{ marginTop: 6, wordBreak: 'break-word' }}>{debugInfo.ua}</div>
      </details>
    </div>
  );
}
