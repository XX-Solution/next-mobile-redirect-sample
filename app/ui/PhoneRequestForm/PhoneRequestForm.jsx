"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./PhoneRequestForm.module.css";

const YM_ID = 106415263;

// ---------- analytics helpers (same as in the first component) ----------
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
    next.landing_page = window.location.href.split("#")[0];
    // если надо без query:
    // next.landing_page = window.location.origin + window.location.pathname;
  }

  if (current) {
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

// ---------- ym helpers (same as in the first component) ----------
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

/**
 * Простая и надёжная валидация:
 * - берём только цифры
 * - длина 10..15 (международный диапазон)
 * - для RU (если начинается с 7/8) приводим к +7XXXXXXXXXX
 */
function normalizePhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  if (!digits) return { ok: false, value: "" };

  if (digits.length === 11 && digits.startsWith("8")) {
    return { ok: true, value: `+7${digits.slice(1)}` };
  }
  if (digits.length === 11 && digits.startsWith("7")) {
    return { ok: true, value: `+${digits}` };
  }

  if (digits.length >= 10 && digits.length <= 15) {
    return { ok: true, value: `+${digits}` };
  }

  return { ok: false, value: "" };
}

export default function PhoneRequestForm({ buttonText = "Отправить", vuz }) {
  const [phone, setPhone] = useState("");
  const [page, setPage] = useState("");
  const [utm, setUtm] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState(false);

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

  const validation = useMemo(() => normalizePhone(phone), [phone]);
  const showError = touched && !validation.ok;

  // tel_input — когда впервые стало валидно
  useEffect(() => {
    const ok = validation.ok;
    if (ok && !telSent.current) {
      telSent.current = true;
      reachGoal("tel_input");
    }
    if (!ok) {
      telSent.current = false;
    }
  }, [validation.ok]);

  async function onSubmit(e) {
    e.preventDefault();
    setTouched(true);
    setServerError("");

    // ✅ Нажал кнопку (даже если невалидный)
    reachGoal("open_form_click");

    if (!validation.ok) return;

    const payload = {
      phone: validation.value,
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
      setIsSubmitting(true);

      const res = await fetch(
        `https://nikolskypomosh.ru/api/service-request-phone/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        let message = "Не удалось отправить заявку. Попробуйте ещё раз.";
        try {
          const data = await res.json();
          message =
            data?.detail ||
            data?.message ||
            (Array.isArray(data?.errors) ? data.errors.join(", ") : "") ||
            message;
        } catch {}
        throw new Error(message);
      }

      // ✅ Успешная отправка формы
      reachGoal("form_submit");

      setSuccess(true);
      setPhone("");
      setTouched(false);
      telSent.current = false; // сбрасываем, чтобы при новой попытке снова отстрелить tel_input
    } catch (err) {
      setServerError(err?.message || "Ошибка отправки формы");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      {success ? (
        <div className={styles.successBox} role="status">
          <div className={styles.successTitle}>Заявка отправлена ✅</div>
          <div className={styles.successText}>
            Мы свяжемся с вами в ближайшее время, чтобы уточнить дисциплину и
            подобрать репетитора.
          </div>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => setSuccess(false)}
          >
            Отправить ещё одну
          </button>
        </div>
      ) : (
        <>
          <label className={styles.label}>
            Номер телефона
            <div className={styles.inputWrap}>
              <input
                className={`${styles.input} ${showError ? styles.inputError : ""}`}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+7 999 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={showError ? "true" : "false"}
                aria-describedby={showError ? "phone-error" : undefined}
              />
            </div>
          </label>

          {showError && (
            <div className={styles.error} id="phone-error">
              Введите корректный номер (10–15 цифр).
            </div>
          )}

          {serverError && <div className={styles.error}>{serverError}</div>}

          <button
            className={styles.primaryBtn}
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Отправка..." : buttonText}
          </button>

          <div className={styles.hint}>
            Мы не спамим. Только уточним детали и предложим преподавателя.
          </div>
        </>
      )}
    </form>
  );
}
