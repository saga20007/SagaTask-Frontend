import Icon from "./Icons";
import { formatDue, isOverdue } from "../utils/dates";

const PRIORITY_LABELS = {
  basse: "Basse",
  moyenne: "Moyenne",
  haute: "Haute",
};

function TodoItem({ todo, index, selected, leaving, onToggle, onSelect }) {
  const priority = todo.priority || "moyenne";
  const late = isOverdue(todo);

  return (
    <li
      className={`todo-item ${todo.completed ? "done" : ""} ${
        selected ? "selected" : ""
      } ${leaving ? "leaving" : ""}`}
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      <button
        type="button"
        className={`check ${todo.completed ? "checked" : ""}`}
        onClick={onToggle}
        aria-label={todo.completed ? "Marquer comme à faire" : "Marquer comme terminée"}
      >
        <svg viewBox="0 0 24 24">
          <polyline points="5 12 10 17 19 7" />
        </svg>
      </button>

      <div className="todo-body" onClick={onSelect}>
        <span className="todo-title">{todo.title}</span>
        <div className="todo-meta">
          {todo.dueDate && (
            <span className={`chip ${late ? "late" : ""}`}>
              <Icon name="calendar" size={12} />
              {formatDue(todo.dueDate, todo.dueTime)}
            </span>
          )}
          <span className={`chip prio ${priority}`}>
            <i className={`dot ${priority}`} />
            {PRIORITY_LABELS[priority]}
          </span>
          {todo.description && <span className="chip">Note</span>}
        </div>
      </div>

      <button
        type="button"
        className="open"
        onClick={onSelect}
        aria-label="Ouvrir le détail"
      >
        <Icon name="chevron-right" />
      </button>
    </li>
  );
}

export default TodoItem;