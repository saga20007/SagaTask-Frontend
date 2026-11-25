import { useState } from "react";
import Icon from "./Icons";
import { dueKey } from "../utils/dates";

const PRIORITIES = [
  { value: "basse", label: "Basse" },
  { value: "moyenne", label: "Moyenne" },
  { value: "haute", label: "Haute" },
];

function DetailForm({ todo, onSave, onDelete, onClose }) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [due, setDue] = useState(dueKey(todo.dueDate) || "");
  const [time, setTime] = useState(todo.dueTime || "");
  const [priority, setPriority] = useState(todo.priority || "moyenne");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);

  const changed =
    title !== todo.title ||
    description !== (todo.description || "") ||
    due !== (dueKey(todo.dueDate) || "") ||
    (due ? time : "") !== (todo.dueTime || "") ||
    priority !== (todo.priority || "moyenne");

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave(todo._id, {
      title: title.trim(),
      description,
      dueDate: due || null,
      dueTime: due ? time : "",
      priority,
    });
    setSaving(false);
  };

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    onDelete(todo._id);
  };

  return (
    <div className="detail-form">
      <div className="detail-head">
        <h2>Détail</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer">
          <Icon name="x" />
        </button>
      </div>

      <div>
        <label className="field-label">Titre</label>
        <input
          type="text"
          className="title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Description</label>
        <textarea
          placeholder="Ajoute des précisions..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="field-label">Échéance</label>
        <div className="date-row">
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
          <input
            type="time"
            value={time}
            disabled={!due}
            onChange={(e) => setTime(e.target.value)}
            aria-label="Heure"
          />
          {due && (
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                setDue("");
                setTime("");
              }}
              aria-label="Retirer la date"
            >
              <Icon name="x" size={14} />
            </button>
          )}
        </div>
        {due && time && (
          <button type="button" className="link-btn" onClick={() => setTime("")}>
            Retirer l'heure
          </button>
        )}
      </div>

      <div>
        <label className="field-label">Priorité</label>
        <div className="prio-group">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              className={`prio-btn ${p.value} ${
                priority === p.value ? "active" : ""
              }`}
              onClick={() => setPriority(p.value)}
            >
              <i className={`dot ${p.value}`} />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {todo.createdAt && (
        <p className="detail-meta">
          Créée le{" "}
          {new Date(todo.createdAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      )}

      <div className="detail-actions">
        <button
          type="button"
          className={`btn outline ${confirming ? "confirm" : ""}`}
          onClick={handleDelete}
        >
          <Icon name="trash" size={15} />
          {confirming ? "Confirmer ?" : "Supprimer"}
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={handleSave}
          disabled={!changed || saving || !title.trim()}
        >
          {saving ? "..." : "Enregistrer"}
        </button>
      </div>
    </div>
  );
}

function TodoDetail({ todo, onSave, onDelete, onClose }) {
  if (!todo) return null;
  return (
    <DetailForm
      key={todo._id}
      todo={todo}
      onSave={onSave}
      onDelete={onDelete}
      onClose={onClose}
    />
  );
}

export default TodoDetail;