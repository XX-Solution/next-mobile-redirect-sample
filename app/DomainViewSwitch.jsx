"use client";

import MainBlockSeo from "./ui/MainBlockSeo/MainBlockSeo";
import White from "./ui/White/White";
import { useDomainView } from "./DomainViewProvider";

export default function DomainViewSwitch() {
  const { view, checking } = useDomainView();

  // Пока идёт проверка, ничего не рендерим (оверлей покажет Provider)
  if (checking) return null;

  return view === "seo" ? (
    <White />
  ) : (
    <White />
  );
}
// "use client";

// import MainBlockSeo from "./ui/MainBlockSeo/MainBlockSeo";
// import White from "./ui/White/White";
// import { useDomainView } from "./DomainViewProvider";

// export default function DomainViewSwitch() {
//   const { view, checking } = useDomainView();

//   // Пока идёт проверка, ничего не рендерим (оверлей покажет Provider)
//   if (checking) return null;

//   // ВАЖНО:
//   // view === 'seo' => показываем MainBlockSeo
//   // view === 'white' => показываем White
//   return view === "seo" ? (
//     <MainBlockSeo
//       title={"Скидка до −50% 🔥\n + кэшбэк 5%"}
//       description={
//         "✅ Не для всех: работаем именно с вашим профилем\n" +
//         "🔑 Закрываем конкретную боль: консультируем «под ключ»\n" +
//         "🔥 Бросаем вызов: вернем деньги если не будет достигнут результат или попросите возврат"
//       }
//       btn="Получить помощь"
//       img="/hero/2.png"
//       width={400}
//       height={648}
//       modal={true}
//       whiteText={true}
//       classStyle={"seo_style"}
//       vyz={"МТИ МОНОБЛОК"}
//     />
//   ) : (
//     <White />
//   );
// }
