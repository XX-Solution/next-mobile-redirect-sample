export default function HomePage() {
  return (
    <main>
      <h1 style={{ marginTop: 0 }}>ПК версия (десктопный домен)</h1>
      <p>
        Если пользователь заходит с <b>реального телефона</b> и не подходит под исключения — будет редирект
        на мобильный домен из <code>NEXT_PUBLIC_MOBILE_ORIGIN</code>.
      </p>

      <div style={{ padding: 16, border: '1px solid #ddd', borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Подсказки</h2>
        <ul style={{ lineHeight: 1.6 }}>
          <li><b>DevTools</b> Device Toolbar на Windows/macOS/Linux — редиректа быть не должно.</li>
          <li><b>Настоящий телефон</b> — должен редиректить (если не YandexBrowser и нет исключений).</li>
          <li>Если редиректа нет — проверь, что в <code>.env.local</code> задан <code>NEXT_PUBLIC_MOBILE_ORIGIN</code> и ты перезапустил dev-сервер.</li>
        </ul>
      </div>
    </main>
  );
}
