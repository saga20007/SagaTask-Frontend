const pad = (n) => String(n).padStart(2, "0");

// Date -> "2026-11-22" (selon le fuseau horaire de l'utilisateur)
export const dateToKey = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Date -> "13:05"
export const timeKey = (date) =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const todayKey = () => dateToKey(new Date());

// "2026-11-22T00:00:00.000Z" -> "2026-11-22"
export const dueKey = (dueDate) => (dueDate ? dueDate.slice(0, 10) : null);

// "13:00" -> "13h00"
export const formatTime = (dueTime) =>
  dueTime ? dueTime.replace(":", "h") : "";

export const formatDue = (dueDate, dueTime) => {
  if (!dueDate) return "";
  const key = dueKey(dueDate);
  let label;

  if (key === todayKey()) {
    label = "Aujourd'hui";
  } else {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (key === dateToKey(tomorrow)) {
      label = "Demain";
    } else {
      const [y, m, d] = key.split("-").map(Number);
      label = new Date(y, m - 1, d).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });
    }
  }

  return dueTime ? `${label} · ${formatTime(dueTime)}` : label;
};

export const formatLongToday = () =>
  new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

// La tâche est-elle en retard ? (date dépassée, ou heure dépassée aujourd'hui)
export const isOverdue = (todo, now = new Date()) => {
  if (todo.completed || !todo.dueDate) return false;
  const due = dueKey(todo.dueDate);
  const today = dateToKey(now);
  if (due < today) return true;
  if (due === today && todo.dueTime) return todo.dueTime < timeKey(now);
  return false;
};