import { useCallback, useRef, useState } from "react";

// Durée d'affichage de chaque type de message, en millisecondes
const DURATIONS = {
  success: 2000,
  delete: 2000,
  error: 3500,
};

function useToast() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  // Lance l'animation de sortie, puis retire le message de la liste
  const dismissToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, leaving: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      const id = nextId.current++;
      const duration = DURATIONS[type] || 2000;
      // On garde au maximum 4 messages à l'écran
      setToasts((prev) =>
        [...prev, { id, message, type, duration, leaving: false }].slice(-4)
      );
      setTimeout(() => dismissToast(id), duration);
    },
    [dismissToast]
  );

  return { toasts, showToast, dismissToast };
}

export default useToast;