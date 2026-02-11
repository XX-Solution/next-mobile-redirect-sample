"use client";

import styles from "./HeaderSocial.module.css";
import { FaVk, FaTelegramPlane, FaWhatsapp } from "react-icons/fa";
import Image from "next/image";
import { reachGoalAndNavigate } from "../../../ym";

function handleOutboundClick(e, goalName) {
  // Ctrl/Meta/Shift/колесо мыши — не мешаем
  if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;

  e.preventDefault();

  const a = e.currentTarget;
  const href = a.getAttribute("href") || "/";
  const target = a.getAttribute("target");

  reachGoalAndNavigate(goalName, () => {
    if (target === "_blank") {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = href;
    }
  });
}

export default function HeaderSocial({ header, headerText }) {
  return (
    <div>
      <div className={styles.socialWrapper}>
        {headerText && <h3>Напишите нам</h3>}
        <span className={styles.socialServices}>
          <a
            className={styles.socialServicesTg}
            href="https://nikolskypomosh.ru/tgl/?utm_source=yandex&utm_medium=cpc&utm_campaign=usl_kurs_search_mob_land_ufo%7C706729688&utm_term=%D1%81%D1%82%D0%BE%D0%B8%D0%BC%D0%BE%D1%81%D1%82%D1%8C%20%D0%BA%D1%83%D1%80%D1%81%D0%BE%D0%B2%D1%8B%D1%85%20%D1%80%D0%B0%D0%B1%D0%BE%D1%82%7C56453219676&utm_content=bid%7C17568593539%7Cctype%7Ctype1%7Ccrtvid%7C0%7Cdvc%7Cmobile%7Cgbid%7C5707610374%7Crtgid%7C56453219676%7Ccgconid%7C0%7Cintid%7C%7Cmt%7Csyn%7Cadtgt%7C56453219676%7Cp%7C1premium%7Csrc%7Cnonesearch%7Creg%7C%D0%90%D1%80%D0%BC%D0%B0%D0%B2%D0%B8%D1%8010987&cm_id=7067296885707610374175685935395645321967656453219676nonesearchtype1nomobilepremium10987&etext=2202.luTvqCSPxfoBV8UCbC6CU-Z9dgy_8kFmDfJ923fbwND_OsyuOcgYWxKxLKUURUlManVsaHhkY2xsamFjd3R0dg.ca41353e72bc92588fdb9c92506126419c9200bb&yclid=13553416508256813055&utm_text=%D0%94%D0%BE%D0%B1%D1%80%D1%8B%D0%B9%20%D0%B4%D0%B5%D0%BD%D1%8C!%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B8%D1%82%D1%8C%20%D1%81%D0%BA%D0%B8%D0%B4%D0%BA%D1%83%2020%25,%20%D0%BC%D0%BE%D0%B9%20%D0%BF%D1%80%D0%BE%D0%BC%D0%BE%D0%BA%D0%BE%D0%B4%20CKNG20%2F"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            onClick={(e) => handleOutboundClick(e, "tg_conversion")}
          >
            <FaTelegramPlane />
          </a>

          <a
            className={styles.socialServicesWa}
            href="https://nikolskypomosh.ru/wa/?utm_source=yandex&utm_medium=cpc&utm_campaign=usl_kurs_search_mob_land_ufo%7C706729688&utm_term=%D1%81%D1%82%D0%BE%D0%B8%D0%BC%D0%BE%D1%81%D1%82%D1%8C%20%D0%BA%D1%83%D1%80%D1%81%D0%BE%D0%B2%D1%8B%D1%85%20%D1%80%D0%B0%D0%B1%D0%BE%D1%82%7C56453219676&utm_content=bid%7C17568593539%7Cctype%7Ctype1%7Ccrtvid%7C0%7Cdvc%7Cmobile%7Cgbid%7C5707610374%7Crtgid%7C56453219676%7Ccgconid%7C0%7Cintid%7C%7Cmt%7Csyn%7Cadtgt%7C56453219676%7Cp%7C1premium%7Csrc%7Cnonesearch%7Creg%7C%D0%90%D1%80%D0%BC%D0%B0%D0%B2%D0%B8%D1%8010987&cm_id=7067296885707610374175685935395645321967656453219676nonesearchtype1nomobilepremium10987&etext=2202.luTvqCSPxfoBV8UCbC6CU-Z9dgy_8kFmDfJ923fbwND_OsyuOcgYWxKxLKUURUlManVsaHhkY2xsamFjd3R0dg.ca41353e72bc92588fdb9c92506126419c9200bb&yclid=13553416508256813055&utm_text=%D0%94%D0%BE%D0%B1%D1%80%D1%8B%D0%B9%20%D0%B4%D0%B5%D0%BD%D1%8C!%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B8%D1%82%D1%8C%20%D1%81%D0%BA%D0%B8%D0%B4%D0%BA%D1%83%2020%25,%20%D0%BC%D0%BE%D0%B9%20%D0%BF%D1%80%D0%BE%D0%BC%D0%BE%D0%BA%D0%BE%D0%B4%20CKNG20%2F"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            onClick={(e) => handleOutboundClick(e, "wa_conversion")}
          >
            <FaWhatsapp />
          </a>

          <a
            className={styles.socialServicesVk}
            href="https://nikolskypomosh.ru/vk/?utm_source=yandex&utm_medium=cpc&utm_campaign=usl_kurs_search_mob_land_ufo%7C706729688&utm_term=%D1%81%D1%82%D0%BE%D0%B8%D0%BC%D0%BE%D1%81%D1%82%D1%8C%20%D0%BA%D1%83%D1%80%D1%81%D0%BE%D0%B2%D1%8B%D1%85%20%D1%80%D0%B0%D0%B1%D0%BE%D1%82%7C56453219676&utm_content=bid%7C17568593539%7Cctype%7Ctype1%7Ccrtvid%7C0%7Cdvc%7Cmobile%7Cgbid%7C5707610374%7Crtgid%7C56453219676%7Ccgconid%7C0%7Cintid%7C%7Cmt%7Csyn%7Cadtgt%7C56453219676%7Cp%7C1premium%7Csrc%7Cnonesearch%7Creg%7C%D0%90%D1%80%D0%BC%D0%B0%D0%B2%D0%B8%D1%8010987&cm_id=7067296885707610374175685935395645321967656453219676nonesearchtype1nomobilepremium10987&etext=2202.luTvqCSPxfoBV8UCbC6CU-Z9dgy_8kFmDfJ923fbwND_OsyuOcgYWxKxLKUURUlManVsaHhkY2xsamFjd3R0dg.ca41353e72bc92588fdb9c92506126419c9200bb&yclid=13553416508256813055&utm_text=%D0%94%D0%BE%D0%B1%D1%80%D1%8B%D0%B9%20%D0%B4%D0%B5%D0%BD%D1%8C!%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B8%D1%82%D1%8C%20%D1%81%D0%BA%D0%B8%D0%B4%D0%BA%D1%83%2020%25,%20%D0%BC%D0%BE%D0%B9%20%D0%BF%D1%80%D0%BE%D0%BC%D0%BE%D0%BA%D0%BE%D0%B4%20CKNG20%2F"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="VK"
            onClick={(e) => handleOutboundClick(e, "vk_conversion")}
          >
            <FaVk />
          </a>

          <a
            className={styles.socialServicesMax}
            href="https://nikolskypomosh.ru/max/?utm_source=yandex&utm_medium=cpc&utm_campaign=usl_kurs_search_mob_land_ufo%7C706729688&utm_term=%D1%81%D1%82%D0%BE%D0%B8%D0%BC%D0%BE%D1%81%D1%82%D1%8C%20%D0%BA%D1%83%D1%80%D1%81%D0%BE%D0%B2%D1%8B%D1%85%20%D1%80%D0%B0%D0%B1%D0%BE%D1%82%7C56453219676&utm_content=bid%7C17568593539%7Cctype%7Ctype1%7Ccrtvid%7C0%7Cdvc%7Cmobile%7Cgbid%7C5707610374%7Crtgid%7C56453219676%7Ccgconid%7C0%7Cintid%7C%7Cmt%7Csyn%7Cadtgt%7C56453219676%7Cp%7C1premium%7Csrc%7Cnonesearch%7Creg%7C%D0%90%D1%80%D0%BC%D0%B0%D0%B2%D0%B8%D1%8010987&cm_id=7067296885707610374175685935395645321967656453219676nonesearchtype1nomobilepremium10987&etext=2202.luTvqCSPxfoBV8UCbC6CU-Z9dgy_8kFmDfJ923fbwND_OsyuOcgYWxKxLKUURUlManVsaHhkY2xsamFjd3R0dg.ca41353e72bc92588fdb9c92506126419c9200bb&yclid=13553416508256813055&utm_text=%D0%94%D0%BE%D0%B1%D1%80%D1%8B%D0%B9%20%D0%B4%D0%B5%D0%BD%D1%8C!%20%D0%A5%D0%BE%D1%87%D1%83%20%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B8%D1%82%D1%8C%20%D1%81%D0%BA%D0%B8%D0%B4%D0%BA%D1%83%2020%25,%20%D0%BC%D0%BE%D0%B9%20%D0%BF%D1%80%D0%BE%D0%BC%D0%BE%D0%BA%D0%BE%D0%B4%20CKNG20%2F"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Max"
            onClick={(e) => handleOutboundClick(e, "max_conversion")}
          >
            <Image src="/max.png" alt="Max" width={54} height={54} />
          </a>
        </span>
      </div>

      <div>{header}</div>
    </div>
  );
}
