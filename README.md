# next-mobile-redirect-sample (client-only redirect)

Next.js (App Router), JavaScript без TypeScript.

## Почему без middleware
Отличить «реальную мобилку» от DevTools-эмуляции на сервере надёжно нельзя.
Поэтому редирект делаем **только на клиенте**.

## Условия показа ПК версии (НЕ редиректить)
ПК версия остаётся, если выполняется **хотя бы одно**:
1) Переход с **любого десктопа** (Windows/macOS/Linux/ChromeOS) — включая DevTools device toolbar
2) Переход с **мобильного**, но:
   - `navigator.deviceMemory > 10` **и**
   - GPU выглядит как «десктопная» (по WebGL renderer; эвристика)
3) Браузер — **YandexBrowserCorp** (`YaBrowser / YandexBrowser / YandexBrowserCorp`)

Иначе — редирект на `NEXT_PUBLIC_MOBILE_ORIGIN`.

## Ручные переключатели
- `?desktop=1` — закрепить ПК (cookie `prefer_desktop=1`)
- `?mobile=1` — снять закрепление и форсировать мобилку

## Запуск
```bash
npm i
cp .env.example .env.local
# в .env.local укажи NEXT_PUBLIC_MOBILE_ORIGIN
npm run dev
```
