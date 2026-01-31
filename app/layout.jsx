import Script from "next/script";
import DomainViewProvider from "./DomainViewProvider";
import "./globals.css";
import { Play } from 'next/font/google';

export const metadata = {
  title: "Репетиторство в любом ВУЗе",
  description:
    "Подбор репетитора под ваш ВУЗ и дисциплину. Быстрая заявка — перезвоним и подберём преподавателя.",
};

export const play = Play({
  weight: ['400', '700'],
  subsets: ['latin'],
});

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head>
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
(function(m,e,t,r,i,k,a){
  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();
  for (var j = 0; j < document.scripts.length; j++) {
    if (document.scripts[j].src === r) { return; }
  }
  k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=106415263', 'ym');

ym(106415263, 'init', {
  ssr:true,
  webvisor:true,
  clickmap:true,
  ecommerce:"dataLayer",
  referrer: document.referrer,
  url: location.href,
  accurateTrackBounce:true,
  trackLinks:true
});
            `.trim(),
          }}
        />
      </head>

      <body className={`${play}`} >
        {/* Провайдер решает: показывать SEO или White */}
        <DomainViewProvider>{children}</DomainViewProvider>

        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/106415263"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}
