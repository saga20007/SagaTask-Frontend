import Icon from "./Icons";
import logo from "../assets/sagatask-logo.png";

const VIEWS = [
  { key: "all", label: "Toutes", icon: "list" },
  { key: "today", label: "Aujourd'hui", icon: "sun" },
  { key: "upcoming", label: "À venir", icon: "clock" },
  { key: "late", label: "En retard", icon: "alert" },
  { key: "done", label: "Terminées", icon: "check-circle" },
];

const PRIORITIES = [
  { key: "p-haute", label: "Haute", color: "haute" },
  { key: "p-moyenne", label: "Moyenne", color: "moyenne" },
  { key: "p-basse", label: "Basse", color: "basse" },
];

function Sidebar({ filter, onFilter, counts, search, onSearch, onLogout, user }) {
  return (
    <aside className="sidebar">
            <div className="brand">
        <span className="brand-logo">
          <img src={logo} alt="" />
        </span>
        <span>SagaTask</span>
      </div>

      <div className="search">
        <Icon name="search" size={16} />
        <input
          type="text"
          placeholder="Rechercher"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <p className="nav-label">Vues</p>
      <nav>
        {VIEWS.map((view) => (
          <button
            key={view.key}
            type="button"
            className={`nav-item ${filter === view.key ? "active" : ""}`}
            onClick={() => onFilter(view.key)}
          >
            <Icon name={view.icon} size={16} />
            <span className="nav-text">{view.label}</span>
            <span
              className={`badge ${
                view.key === "late" && counts.late > 0 ? "warn" : ""
              }`}
            >
              {counts[view.key]}
            </span>
          </button>
        ))}
      </nav>

      <p className="nav-label">Priorités</p>
      <nav>
        {PRIORITIES.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`nav-item ${filter === p.key ? "active" : ""}`}
            onClick={() => onFilter(p.key)}
          >
            <i className={`dot ${p.color}`} />
            <span className="nav-text">{p.label}</span>
            <span className="badge">{counts[p.key]}</span>
          </button>
        ))}
      </nav>

            <div className="sidebar-footer">
        {user && (
          <p className="sidebar-greeting">
            Salut, <strong>{user.name}</strong>
          </p>
        )}

        <div className="sidebar-bottom">
          <button type="button" className="nav-item" onClick={onLogout}>
            <Icon name="log-out" size={16} />
            <span className="nav-text">Se déconnecter</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;