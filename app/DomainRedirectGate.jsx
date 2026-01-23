'use client';

import { useEffect, useState } from 'react';

const MOBILE_ORIGIN = process.env.NEXT_PUBLIC_API_URL;
const DEBUG = process.env.NEXT_PUBLIC_REDIRECT_DEBUG === '1';

// --- helpers ---
function getUA() {
  try { return navigator.userAgent || ''; } catch { return ''; }
}
function getUAD() {
  try { return navigator.userAgentData || null; } catch { return null; }
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
  const plat = String(platform || '');
  const isMacLike = /Mac/i.test(plat) || /Macintosh/i.test(ua);
  const hasTouch = (navigator.maxTouchPoints || 0) > 1;
  const hasMobileToken = /Mobile/i.test(ua);
  return isMacLike && hasTouch && hasMobileToken;
}
function isDesktopPlatform(platform, ua) {
  const p = String(platform).toLowerCase();

  if (isProbablyIPad(ua, platform)) return false;

  const looksDesktop =
    p.includes('win') ||
    p.includes('mac') ||
    p.includes('darwin') ||
    p.includes('cros') ||
    p === 'linux' ||
    p.includes('x11');

  if (/android/i.test(ua) || /iphone|ipad|ipod/i.test(ua)) return false;
  if (p.includes('android') || p.includes('ios')) return false;

  return looksDesktop;
}
function isMobileLike(uad, ua, platform) {
  if (uad && typeof uad.mobile === 'boolean') return uad.mobile;

  if (isProbablyIPad(ua, platform)) return true;

  if (isLikelyMobileByUA(ua)) return true;

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
  return /NVIDIA|GeForce|RTX|GTX|Quadro|AMD|Radeon|RX\s?\d+|Intel\(R\)\s?Arc/i.test(renderer);
}
function getQueryParam(name) {
  try { return new URLSearchParams(window.location.search).get(name); } catch { return null; }
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

  try {
    if (window.location.origin === MOBILE_ORIGIN) return false;
  } catch {}

  const { pathname, search, hash } = window.location;
  const target = `${MOBILE_ORIGIN}${pathname}${search}${hash}`;
  window.location.replace(target);
  return true;
}

function FullscreenLoader({ show, withDebug, debugInfo }) {
  if (!show && !(withDebug && debugInfo)) return null;

  return (
    <>
      <style>{`
        @keyframes gateSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .gateSpinner { animation: none !important; }
        }
      `}</style>

      {show && (
        <div
          aria-live="polite"
          aria-busy="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            display: 'grid',
            placeItems: 'center',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'grid', placeItems: 'center', gap: 10 }}>
            <div
              className="gateSpinner"
              style={{
                width: 54,
                height: 54,
                borderRadius: '50%',
                border: '6px solid rgba(15, 23, 42, 0.12)',
                borderTopColor: '#facc15', // жёлтый
                animation: 'gateSpin 0.9s linear infinite',
              }}
            />
            <div style={{ fontSize: 13, color: 'rgba(15, 23, 42, 0.7)' }}>
              Загружаем страницу…
            </div>
          </div>
        </div>
      )}

      {/* debug-панель можно оставить как была (поверх всего) */}
      {withDebug && debugInfo && (
        <div
          style={{
            position: 'fixed',
            bottom: 12,
            right: 12,
            zIndex: 1000000,
            width: 360,
            maxWidth: 'calc(100vw - 24px)',
            background: 'rgba(0,0,0,0.85)',
            color: 'white',
            padding: 12,
            borderRadius: 12,
            fontSize: 12,
            lineHeight: 1.35,
          }}
        >
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
      )}
    </>
  );
}

export default function DomainRedirectGate() {
  const [checking, setChecking] = useState(true);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const ua = getUA();
    const uad = getUAD();
    const platform = getPlatform(uad);
    const reasons = [];
    let decision = 'keep_desktop';

    // маленький хелпер, чтобы во всех "keep_desktop" ветках не забыть убрать лоадер
    const keepDesktopAndDone = () => {
      setChecking(false);
      if (DEBUG) setDebugInfo({ decision: 'keep_desktop', reasons, ua, platform, mem: navigator.deviceMemory ?? null, renderer: null, uad });
    };

    // --- env check ---
    if (!MOBILE_ORIGIN) {
      reasons.push('MOBILE_ORIGIN not set (NEXT_PUBLIC_API_URL)');
      keepDesktopAndDone();
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
      keepDesktopAndDone();
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
      // checking оставляем true — пока страница уходит на replace()
      return;
    }

    // --- закрепление ПК ---
    if (hasCookie('prefer_desktop', '1')) {
      reasons.push('cookie prefer_desktop=1');
      keepDesktopAndDone();
      return;
    }

    // --- Яндекс.Браузер всегда ПК ---
    if (isYandexBrowser(ua)) {
      reasons.push('YandexBrowser detected => keep desktop');
      keepDesktopAndDone();
      return;
    }

    // --- любой десктоп (включая DevTools device toolbar) ---
    if (isDesktopPlatform(platform, ua)) {
      reasons.push(`desktop platform detected (${platform}) => keep desktop`);
      keepDesktopAndDone();
      return;
    }

    // --- далее: мобильное/планшет ---
    const mobileLike = isMobileLike(uad, ua, platform);
    if (!mobileLike) {
      reasons.push('not mobile-like => keep desktop');
      keepDesktopAndDone();
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
      setChecking(false);
      if (DEBUG) setDebugInfo({ decision: 'keep_desktop', reasons, ua, platform, mem, renderer, uad });
      return;
    }

    // --- иначе редирект ---
    reasons.push('real mobile (no desktop exceptions) => redirect to mobile origin');
    decision = 'redirect_mobile';

    const didRedirect = redirectToMobile();
    if (DEBUG) setDebugInfo({ decision: didRedirect ? decision : 'keep_desktop', reasons, ua, platform, mem, renderer, uad });

    // checking оставляем true — оверлей будет до ухода со страницы
  }, []);

  return (
    <FullscreenLoader
      show={checking}
      withDebug={DEBUG}
      debugInfo={debugInfo}
    />
  );
}
