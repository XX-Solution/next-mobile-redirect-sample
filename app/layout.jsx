import Script from "next/script";
import DomainRedirectGate from "./DomainRedirectGate";

export const metadata = {
  title: "Репетиторство в любом ВУЗе",
  description:
    "Подбор репетитора под ваш ВУЗ и дисциплину. Быстрая заявка — перезвоним и подберём преподавателя.",
};

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

      <body
        style={{
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
          margin: 0,
          color: "#0f172a",
          background:
            "radial-gradient(1200px 700px at 20% 10%, rgba(56,189,248,.18), transparent 60%), radial-gradient(1000px 600px at 80% 0%, rgba(99,102,241,.16), transparent 55%), #ffffff",
        }}
      >
        {/* <DomainRedirectGate />  */}

        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/106415263"
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>

        <div
          style={{
            padding: "24px",
            maxWidth: 1100,
            margin: "0 auto",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}
