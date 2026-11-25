import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import Sidebar from "../components/Sidebar";
import TodoItem from "../components/TodoItem";
import TodoDetail from "../components/TodoDetail";
import ToastContainer from "../components/ToastContainer";
import Icon from "../components/Icons";
import useToast from "../hooks/useToast";
import { dateToKey, dueKey, formatLongToday, isOverdue } from "../utils/dates";
import "./Todos.css";

const TITRES = {
  all: "Toutes mes tâches",
  today: "Aujourd'hui",
  upcoming: "À venir",
  late: "En retard",
  done: "Terminées",
  "p-haute": "Priorité haute",
  "p-moyenne": "Priorité moyenne",
  "p-basse": "Priorité basse",
};

const VIDES = {
  all: "Aucune tâche pour le moment. Ajoute la première !",
  today: "Rien de prévu aujourd'hui.",
  upcoming: "Aucune tâche à venir.",
  late: "Aucune tâche en retard. Bravo !",
  done: "Aucune tâche terminée pour l'instant.",
  "p-haute": "Aucune tâche de priorité haute.",
  "p-moyenne": "Aucune tâche de priorité moyenne.",
  "p-basse": "Aucune tâche de priorité basse.",
};

// Cette tâche appartient-elle à cette vue ?
const matchesFilter = (todo, filter, now) => {
  const today = dateToKey(now);
  const due = dueKey(todo.dueDate);
  const priority = todo.priority || "moyenne";
  switch (filter) {
    case "today":
      return due === today;
    case "upcoming":
      return !todo.completed && due !== null && due > today;
    case "late":
      return isOverdue(todo, now);
    case "done":
      return todo.completed;
    case "p-haute":
      return !todo.completed && priority === "haute";
    case "p-moyenne":
      return !todo.completed && priority === "moyenne";
    case "p-basse":
      return !todo.completed && priority === "basse";
    default:
      return true;
  }
};

// À faire d'abord, puis par date, puis par heure, puis les plus récentes
const sortTodos = (list) =>
  [...list].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const da = dueKey(a.dueDate) || "9999";
    const db = dueKey(b.dueDate) || "9999";
    if (da !== db) return da < db ? -1 : 1;
    const ta = a.dueTime || "99:99";
    const tb = b.dueTime || "99:99";
    if (ta !== tb) return ta < tb ? -1 : 1;
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });

function Todos() {
  const navigate = useNavigate();
  const { toasts, showToast, dismissToast } = useToast();

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [leavingId, setLeavingId] = useState(null);
  const [user, setUser] = useState(null);
  const [now, setNow] = useState(() => new Date());

  // Met l'heure à jour chaque minute (pour que les retards se déclenchent seuls)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const res = await API.get("/todos");
        setTodos(res.data);
      } catch {
        showToast("Impossible de charger les tâches.", "error");
      } finally {
        setLoading(false);
      }
    };
    loadTodos();
  }, [showToast]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
      } catch {
        // Le nom est un confort : on ignore l'erreur
      }
    };
    loadUser();
  }, []);

  const today = dateToKey(now);

  // Nombre de tâches pour chaque vue (affiché dans le menu)
  const counts = {};
  Object.keys(TITRES).forEach((key) => {
    counts[key] = todos.filter((t) => matchesFilter(t, key, now)).length;
  });

  // Liste affichée : vue choisie + recherche + tri
  const query = search.trim().toLowerCase();
  const visibleTodos = sortTodos(
    todos
      .filter((t) => matchesFilter(t, filter, now))
      .filter((t) =>
        `${t.title} ${t.description || ""}`.toLowerCase().includes(query)
      )
  );

  const doneCount = visibleTodos.filter((t) => t.completed).length;
  const percent = visibleTodos.length
    ? Math.round((doneCount / visibleTodos.length) * 100)
    : 0;
  const showProgress =
    (filter === "all" || filter === "today") && visibleTodos.length > 0;

  const selectedTodo = todos.find((t) => t._id === selectedId) || null;

  const addTodo = async (e) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) {
      showToast("Écris un titre avant d'ajouter la tâche.", "error");
      return;
    }
    try {
      const res = await API.post("/todos", {
        title,
        dueDate: filter === "today" ? today : null,
      });
      setTodos([res.data, ...todos]);
      setNewTitle("");
      showToast("Tâche ajoutée");
    } catch {
      showToast("Impossible d'ajouter la tâche.", "error");
    }
  };

  const updateTodo = async (id, changes, message) => {
    try {
      const res = await API.put(`/todos/${id}`, changes);
      setTodos((prev) => prev.map((t) => (t._id === id ? res.data.todo : t)));
      if (message) showToast(message);
      return true;
    } catch {
      showToast("Impossible de modifier la tâche.", "error");
      return false;
    }
  };

  const toggleTodo = (todo) =>
    updateTodo(
      todo._id,
      { completed: !todo.completed },
      todo.completed ? "Tâche remise à faire" : "Tâche terminée"
    );

  const deleteTodo = async (id) => {
    try {
      await API.delete(`/todos/${id}`);
      setLeavingId(id);
      if (selectedId === id) setSelectedId(null);
      showToast("Tâche supprimée", "delete");
      setTimeout(() => {
        setTodos((prev) => prev.filter((t) => t._id !== id));
        setLeavingId(null);
      }, 250);
    } catch {
      showToast("Impossible de supprimer la tâche.", "error");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const changeFilter = (key) => {
    setFilter(key);
    setSelectedId(null);
  };

  return (
    <div className="todos-page">
      <div className={`shell ${selectedTodo ? "detail-open" : ""}`}>
        <Sidebar
          filter={filter}
          onFilter={changeFilter}
          counts={counts}
          search={search}
          onSearch={setSearch}
          onLogout={logout}
          user={user}
        />

        <main className="main">
          <header className="main-header">
            <div>
              <p className="date-line">{formatLongToday()}</p>
              <h1>{TITRES[filter]}</h1>
            </div>
            <span className="counter">{visibleTodos.length}</span>
          </header>

          {showProgress && (
            <div className="progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${percent}%` }} />
              </div>
              <span>
                {doneCount} sur {visibleTodos.length} terminée
                {visibleTodos.length > 1 ? "s" : ""}
              </span>
            </div>
          )}

          <form className="add-form" onSubmit={addTodo}>
            <Icon name="plus" />
            <input
              type="text"
              placeholder={
                filter === "today"
                  ? "Ajouter une tâche pour aujourd'hui..."
                  : "Ajouter une tâche..."
              }
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            {newTitle.trim() && (
              <button type="submit" className="add-btn">
                Ajouter
              </button>
            )}
          </form>

          {loading ? (
            <p className="empty">Chargement...</p>
          ) : visibleTodos.length === 0 ? (
            <p className="empty">
              {query ? "Aucun résultat pour cette recherche." : VIDES[filter]}
            </p>
          ) : (
            <ul className="todo-list">
              {visibleTodos.map((todo, index) => (
                <TodoItem
                  key={todo._id}
                  todo={todo}
                  index={index}
                  selected={todo._id === selectedId}
                  leaving={todo._id === leavingId}
                  onToggle={() => toggleTodo(todo)}
                  onSelect={() =>
                    setSelectedId(todo._id === selectedId ? null : todo._id)
                  }
                />
              ))}
            </ul>
          )}
        </main>

        <aside className="detail">
          <TodoDetail
            todo={selectedTodo}
            onSave={(id, changes) =>
              updateTodo(id, changes, "Modifications enregistrées")
            }
            onDelete={deleteTodo}
            onClose={() => setSelectedId(null)}
          />
        </aside>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default Todos;