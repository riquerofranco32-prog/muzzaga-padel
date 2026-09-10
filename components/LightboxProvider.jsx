"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const LightboxContext = createContext(null);

/**
 * @returns {(src: string, caption?: string) => void} opens the shared lightbox with a photo
 */
export function useLightbox() {
  const ctx = useContext(LightboxContext);
  if (!ctx) throw new Error("useLightbox must be used inside LightboxProvider");
  return ctx;
}

export default function LightboxProvider({ children }) {
  const [photo, setPhoto] = useState(null);
  const lastFocusedEl = useRef(null);
  const closeBtnRef = useRef(null);

  const open = useCallback((src, caption) => {
    lastFocusedEl.current = document.activeElement;
    setPhoto({ src, caption: caption || "Muzzaga Pádel · Catriel, Río Negro" });
  }, []);

  const close = useCallback(() => {
    setPhoto(null);
    if (lastFocusedEl.current) lastFocusedEl.current.focus();
  }, []);

  useEffect(() => {
    if (!photo) return;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = "";
    };
  }, [photo]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") close();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [close]);

  return (
    <LightboxContext.Provider value={open}>
      {children}

      <div
        className={`lightbox-modal${photo ? " active" : ""}`}
        onClick={close}
        role="dialog"
        aria-modal="true"
        aria-label="Foto ampliada de Muzzaga Pádel"
      >
        <button
          type="button"
          ref={closeBtnRef}
          className="lightbox-close"
          onClick={close}
          aria-label="Cerrar imagen"
        >
          &times;
        </button>
        <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
          {photo && (
            <>
              <img
                src={photo.src}
                alt="Foto Muzzaga Pádel"
                className="lightbox-img"
              />
              <div className="lightbox-caption">{photo.caption}</div>
            </>
          )}
        </div>
      </div>
    </LightboxContext.Provider>
  );
}
