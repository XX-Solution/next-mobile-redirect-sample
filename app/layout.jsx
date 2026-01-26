import DomainRedirectGate from "./DomainRedirectGate";

export const metadata = {
  title: "Репетиторство в любом ВУЗе",
  description:
    "Подбор репетитора под ваш ВУЗ и дисциплину. Быстрая заявка — перезвоним и подберём преподавателя.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
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
        {/* <DomainRedirectGate /> */}

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
