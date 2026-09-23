"use client";

import { useCallback, useRef, useState } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";

const DEFAULT_DURATION_MS = 5000;

/**
 * Toasts para confirmar acciones ("Venta registrada · $12.000 · Deshacer").
 * show(message, { tone: "success" | "error", action: { label, onClick } })
 */
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (
      message,
      { tone = "success", action, duration = DEFAULT_DURATION_MS } = {},
    ) => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts((list) => [...list, { id, message, tone, action }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  return { toasts, show, dismiss };
}

export function Toaster({ toasts, onDismiss }) {
  return (
    <div className="admin-toaster" role="status" aria-live="polite">
      {toasts.map((t) => {
        const Icon = t.tone === "error" ? CircleAlert : CircleCheck;
        return (
          <div key={t.id} className="admin-toast" data-tone={t.tone}>
            <Icon size={18} strokeWidth={1.75} aria-hidden />
            <span className="admin-toast-msg">{t.message}</span>
            {t.action && (
              <button
                type="button"
                className="admin-toast-action"
                onClick={() => {
                  onDismiss(t.id);
                  t.action.onClick();
                }}
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              aria-label="Cerrar aviso"
            >
              <X size={16} strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
