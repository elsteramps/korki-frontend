import React, { useEffect, useState } from "react";

const DEFAULT_CONSENT = {
  necessary: true,      // zawsze włączone
  analytics: false,
  marketing: false,
};

export default function CookieConsent({ onChange }) {
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(DEFAULT_CONSENT);

  useEffect(() => {
    const saved = localStorage.getItem("cookie-consent");
    if (saved) {
      const parsed = JSON.parse(saved);
      setConsent({ ...DEFAULT_CONSENT, ...parsed });
      onChange?.(parsed);
    } else {
      setOpen(true);
    }
  }, [onChange]);

  const save = (next) => {
    localStorage.setItem("cookie-consent", JSON.stringify(next));
    setConsent(next);
    onChange?.(next);
  };

  const acceptAll = () => {
    const next = { necessary: true, analytics: true, marketing: true };
    save(next);
    setOpen(false);
  };

  const rejectAll = () => {
    const next = { necessary: true, analytics: false, marketing: false };
    save(next);
    setOpen(false);
  };

  const saveSelected = () => {
    save(consent);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="cookie-overlay">
      <div className="cookie-card">
        <h3>Używamy plików cookies</h3>
        <p>
          Używamy niezbędnych plików cookies do działania strony. Opcjonalnie możesz
          włączyć analitykę i marketing. Szczegóły w{" "}
          <a href="/polityka-prywatnosci">Polityce Prywatności</a>.
        </p>

        <div className="cookie-groups">
          <label className="cookie-item">
            <input type="checkbox" checked disabled />
            Niezbędne (zawsze aktywne)
          </label>

          <label className="cookie-item">
            <input
              type="checkbox"
              checked={consent.analytics}
              onChange={(e) =>
                setConsent((c) => ({ ...c, analytics: e.target.checked }))
              }
            />
            Analityczne (np. statystyki odwiedzin)
          </label>

          <label className="cookie-item">
            <input
              type="checkbox"
              checked={consent.marketing}
              onChange={(e) =>
                setConsent((c) => ({ ...c, marketing: e.target.checked }))
              }
            />
            Marketingowe (np. piksel reklamowy)
          </label>
        </div>

        <div className="cookie-actions">
          <button onClick={rejectAll}>Odrzuć</button>
          <button onClick={saveSelected}>Zapisz wybór</button>
          <button className="primary" onClick={acceptAll}>Akceptuj wszystkie</button>
        </div>
      </div>
    </div>
  );
}
