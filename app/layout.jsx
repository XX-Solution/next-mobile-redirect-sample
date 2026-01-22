import DomainRedirectGate from './DomainRedirectGate';

export const metadata = {
  title: 'Desktop Site (sample)',
  description: 'Client-only redirect to a mobile domain with custom rules',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif', margin: 0 }}>
        <DomainRedirectGate />
        <div style={{ padding: '24px', maxWidth: 900, margin: '0 auto' }}>
          {children}
        </div>
      </body>
    </html>
  );
}
