'use client';

import { useEffect } from 'react';

const MOBILE_ORIGIN = process.env.NEXT_PUBLIC_MOBILE_ORIGIN;

// --- helpers ---
function getUA() {
  try {
    return navigator.userAgent || '';
  } catch {
    return '';
  }
}

function isYandexBrowser(ua) {
  return /YandexBrowserCorp|YaBrowser|YandexBrowser/i.test(ua);
}

function isLikelyMobile(ua) {
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

function getPlatform() {
  // Prefer UA-CH when available
  const uad = navigator.userAgentData;
  if (uad && typeof uad.platform === 'string' && uad.platform) return uad.platform;
  return navigator.platform || '';
}

function isDesktopPlatform(platform, ua) {
  const p = String(platform).toLowerCase();

  const looksDesktop =
    p.includes('win') ||
    p.includes('mac') ||
    p.includes('darwin') ||
    p.includes('cros') ||
    p.includes('linux');

  // На Android navigator.platform иногда "Linux armv8l" — не считаем это десктопом
  if (/android/i.test(ua) || /iphone|ipad|ipod/i.test(ua)) return false;

  return looksDesktop;
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
  return /NVIDIA|GeForce|RTX|GTX|Quadro|AMD|Radeon|RX\s?\d+|Intel\(R\)\s?Arc/i.test(renderer);
}

function getQueryParam(name) {
  try {
    const sp = new URLSearchParams(window.location.search);
    return sp.get(name);
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
  if (!MOBILE_ORIGIN) return;

  const { pathname, search, hash } = window.location;
  const target = `${MOBILE_ORIGIN}${pathname}${search}${hash}`;

  // replace — чтобы не оставлять "десктоп" в истории при авто-редиректе
  window.location.replace(target);
}

export default function DomainRedirectGate() {
  useEffect(() => {
    const ua = getUA();
    const platform = getPlatform();

    // --- ручные переключатели ---
    const desktopParam = getQueryParam('desktop');
    const mobileParam = getQueryParam('mobile');

    if (desktopParam === '1') {
      setCookie('prefer_desktop', '1');
      // Убираем параметр из URL (без перезагрузки)
      const url = new URL(window.location.href);
      url.searchParams.delete('desktop');
      window.history.replaceState({}, '', url.toString());
      return;
    }

    if (mobileParam === '1') {
      deleteCookie('prefer_desktop');
      const url = new URL(window.location.href);
      url.searchParams.delete('mobile');
      window.history.replaceState({}, '', url.toString());
      redirectToMobile();
      return;
    }

    // --- закрепление ПК ---
    if (hasCookie('prefer_desktop', '1')) return;

    // --- Яндекс.Браузер всегда ПК ---
    if (isYandexBrowser(ua)) return;

    // --- любой десктоп (включая DevTools device toolbar) ---
    // Это покрывает случай: Windows + DevTools эмуляция телефона (UA mobile), но platform всё равно desktop.
    if (isDesktopPlatform(platform, ua)) return;

    // --- дальше считаем, что устройство мобильное/планшет ---
    const uad = navigator.userAgentData;
    const mobileLike = isLikelyMobile(ua) || (uad && uad.mobile === true);

    if (!mobileLike) {
      // если не похоже на мобилку — оставляем ПК
      return;
    }

    // --- исключение: "мощная мобилка" + "десктопная GPU" ---
    const mem = typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null;
    const isHighMem = typeof mem === 'number' && mem > 10;

    let desktopGpu = false;
    if (isHighMem) {
      const renderer = getWebGLRenderer();
      desktopGpu = looksLikeDesktopGPU(renderer);
    }

    if (isHighMem && desktopGpu) return;

    // --- иначе редирект на мобильный домен ---
    redirectToMobile();
  }, []);

  return null;
}
