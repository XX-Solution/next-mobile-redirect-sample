"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import styles from "./PhoneRequestForm.module.css";
import HeaderSocial from "../Header/components/HeaderSocial/HeaderSocial";

const YM_ID = 106415263;

// ---------- analytics helpers (inline) ----------
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[2]) : null;
}

function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function buildAnalyticsFromWindow() {
  if (typeof window === "undefined") return null;

  const url = new URL(window.location.href);
  const sp = url.searchParams;

  const analytics = {};
  const keys = [
    "yclid",
    "gclid",
    "fbclid",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "utm_text",
  ];

  for (const k of keys) {
    const v = sp.get(k);
    if (v != null && String(v).trim() !== "") analytics[k] = v;
  }

  analytics.original_query = url.search || "";
  analytics.referrer = document.referrer || null;
  analytics.ym_uid = getCookie("_ym_uid");

  return analytics;
}

/**
 * localStorage utm_data:
 * - landing_page и visit_timestamp фиксируются только 1 раз (первый заход)
 * - UTM/yclid обновляются, если пришли в текущем URL
 */
function initAndGetAnalyticsStorage() {
  if (typeof window === "undefined") return null;

  const nowIso = new Date().toISOString();
  const current = buildAnalyticsFromWindow();

  const raw = localStorage.getItem("utm_data");
  const stored = raw ? safeJsonParse(raw) : null;

  const next = { ...(stored || {}) };

  // фиксируем только при первом заходе
  if (!next.visit_timestamp) next.visit_timestamp = nowIso;
  if (!next.landing_page) {
    // первый URL захода (с querystring). Если нужно без query — см. комментарий ниже.
    next.landing_page = window.location.href.split("#")[0];
    // без query:
    // next.landing_page = window.location.origin + window.location.pathname;
  }

  if (current) {
    // можно обновлять всегда
    next.referrer = current.referrer ?? next.referrer ?? null;
    next.original_query = current.original_query ?? next.original_query ?? "";

    const updatableKeys = [
      "yclid",
      "gclid",
      "fbclid",
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "utm_text",
      "ym_uid",
    ];

    for (const k of updatableKeys) {
      if (current[k] != null && String(current[k]).trim() !== "") {
        next[k] = current[k];
      }
    }
  }

  localStorage.setItem("utm_data", JSON.stringify(next));
  return next;
}

// ---------- ym helpers ----------
function waitForYm(timeoutMs = 1500) {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (typeof window.ym === "function") return resolve(true);

    const started = Date.now();
    const tick = () => {
      if (typeof window.ym === "function") return resolve(true);
      if (Date.now() - started >= timeoutMs) return resolve(false);
      setTimeout(tick, 50);
    };
    tick();
  });
}

async function reachGoal(goalName, params) {
  try {
    if (typeof window === "undefined") return false;

    const ok = await waitForYm();
    if (!ok || typeof window.ym !== "function") return false;

    window.ym(YM_ID, "reachGoal", goalName, params || {});
    return true;
  } catch {
    return false;
  }
}

export default function PhoneRequestForm({ buttonText, vuz }) {
  const [phone, setPhone] = useState("");
  const [isInvalid, setIsInvalid] = useState(false);

  const [page, setPage] = useState("");
  const [utm, setUtm] = useState(null); // тут лежит analytics объект из localStorage

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // чтобы tel_input стрелял 1 раз на одно "валидное заполнение"
  const telSent = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setPage(window.location.href);

    try {
      const a = initAndGetAnalyticsStorage();
      setUtm(a);
    } catch (e) {
      console.error("Ошибка инициализации analytics", e);
    }
  }, []);

  const validatePhone = useCallback((value) => {
    return String(value || "").replace(/\D/g, "").length >= 11;
  }, []);

  const handleBtnClick = useCallback(async () => {
    if (isSubmitting) return;

    // ✅ Нажал кнопку
    reachGoal("open_form_click");

    if (!phone.trim() || !validatePhone(phone)) {
      setIsInvalid(true);
      return;
    }

    setIsInvalid(false);
    setSubmitError("");
    setIsSubmitting(true);

    const payload = {
      phone,
      page,
      vuz: vuz || null,
      analytics: {
        yclid: utm?.yclid || null,
        utm_source: utm?.utm_source || null,
        utm_medium: utm?.utm_medium || null,
        utm_campaign: utm?.utm_campaign || null,
        utm_content: utm?.utm_content || null,
        utm_term: utm?.utm_term || null,
        utm_text: utm?.utm_text || null,
        original_query: utm?.original_query || "",
        referrer: utm?.referrer || null,
        landing_page: utm?.landing_page || null,
        ym_uid: utm?.ym_uid || null,
        visit_timestamp: utm?.visit_timestamp || null,
      },
    };

    try {
      const res = await fetch(
        `https://nikolskypomosh.ru/api/service-request-phone/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        let msg = "Не удалось отправить номер. Попробуйте ещё раз.";
        try {
          const data = await res.json();
          if (data?.detail) msg = data.detail;
          if (data?.message) msg = data.message;
        } catch {}
        throw new Error(msg);
      }

      // ✅ Отправил форму
      reachGoal("form_submit");

      setIsSent(true);
      setPhone("");
      telSent.current = false;
    } catch (e) {
      setSubmitError(e?.message || "Ошибка отправки. Попробуйте ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, phone, page, vuz, utm, validatePhone]);

  // экран успеха
  if (isSent) {
    return (
      <div className={styles.form}>
        <div className={styles.container}>
          <h4 className={styles.h4}>✅ Номер успешно отправлен</h4>
          <p className={styles.smallText}>
            Менеджер свяжется с вами в ближайшее время.
          </p>

          <button
            className="btn--warning"
            onClick={() => {
              setIsSent(false);
              setSubmitError("");
              setIsInvalid(false);
            }}
          >
            Отправить ещё раз
          </button>

          <span className={styles.headerSocial}>
            <HeaderSocial header={""} />
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.form}>
        <div className={styles.container}>
          <h4 className={styles.h4}>🔥 Оставьте заявку</h4>

          <PhoneInput
            country={"ru"}
            onlyCountries={["ru", "kz", "by", "uz", "am", "kg", "ge"]}
            preferredCountries={["ru"]}
            value={phone}
            onChange={(value) => {
              setPhone(value);
              setIsInvalid(false);
              setSubmitError("");

              const ok = validatePhone(value);
              if (ok && !telSent.current) {
                telSent.current = true;
                reachGoal("tel_input");
              }
              if (!ok) telSent.current = false;
            }}
            inputClass={`${styles.phoneInput} ${
              isInvalid ? styles.phoneInputError : ""
            }`}
            containerClass={styles.phoneContainer}
            buttonClass={styles.flagDropdown}
            dropdownClass={styles.countryList}
            localization={{
              ru: "Россия",
              kz: "Казахстан",
              by: "Беларусь",
              uz: "Узбекистан",
              am: "Армения",
              kg: "Киргизия",
              ge: "Грузия",
            }}
          />

          <button
            className={styles.btnWarning}
            onClick={handleBtnClick}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Отправляем…" : buttonText || "Получить помощь"}
          </button>

          <p className={styles.smallText}>
            Нажимая на кнопку, вы подтверждаете ваше согласие c{" "}
            <a
              className={styles.textLink}
              href="/docs/Пользовательское_соглашение_Оферта_Никольский_Помощь (2).pdf"
              download
            >
              условиями передачи информации
            </a>
          </p>
        </div>

        {isInvalid && (
          <p className={styles.errorMessage}>Введите корректный номер телефона</p>
        )}

        {!!submitError && (
          <p className={styles.errorMessage}>{submitError}</p>
        )}
      </div>

      <span className={styles.headerSocial}>
        <h2 className={styles.h44}>Или напишите уже сейчас</h2>
        <HeaderSocial header={""} />
      </span>
    </>
  );
}
