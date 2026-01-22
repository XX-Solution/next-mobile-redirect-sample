# next-mobile-redirect-sample (client-only redirect)

Next.js (App Router), JavaScript без TypeScript. **Без middleware** — редирект только на клиенте.

> Важно: после изменения `.env.local` перезапусти `npm run dev`, иначе env может не подхватиться.

## Условия показа ПК версии (НЕ редиректить)
ПК версия остаётся, если выполняется **хотя бы одно**:
1) Переход с **любого десктопа** (Windows/macOS/Linux/ChromeOS) — **включая DevTools/эмуляцию**
2) Переход с **мобильного**, но:
   - `navigator.deviceMemory > 10` **и**
   - GPU выглядит как «десктопная» (по WebGL renderer; эвристика)
3) Браузер — **YandexBrowserCorp** (`YaBrowser / YandexBrowser / YandexBrowserCorp`)

Иначе — редирект на `NEXT_PUBLIC_MOBILE_ORIGIN`.

## Ручные переключатели
- `?desktop=1` — закрепить ПК (cookie `prefer_desktop=1`)
- `?mobile=1` — снять закрепление и форсировать мобилку

## Дебаг
Включи в `.env.local`:
```bash
NEXT_PUBLIC_REDIRECT_DEBUG=1
```
Тогда на странице появится панель с тем, что определилось (ua/platform/memory/gpu) и почему редирект сработал/не сработал.

## Запуск
```bash
npm i
cp .env.example .env.local
# в .env.local укажи NEXT_PUBLIC_MOBILE_ORIGIN
npm run dev
```
