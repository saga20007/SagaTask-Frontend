import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import "./AuthPage.css";
import logo from "../assets/sagatask-logo.png";

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // true = on montre l'inscription, false = on montre la connexion
  const [isSignUp, setIsSignUp] = useState(location.pathname === "/register");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (signUp) => {
    setError("");
    setSuccess("");
    setIsSignUp(signUp);
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", loginData);
      localStorage.setItem("token", res.data.token);
      navigate("/todos");
    } catch (err) {
      setError(err.response?.data?.error || "Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await API.post("/auth/register", registerData);
      setLoginData({ email: registerData.email, password: "" });
      setRegisterData({ name: "", email: "", password: "" });
      setSuccess("Compte créé ! Tu peux te connecter.");
      setIsSignUp(false);
    } catch (err) {
      setError(err.response?.data?.error || "Impossible de contacter le serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-container ${isSignUp ? "active" : ""}`}>
        {/* Formulaire d'inscription */}
        <div className="form-container sign-up">
          <form onSubmit={handleRegister}>
            <img src={logo} alt="SagaTask" className="auth-logo" />
            <h1>Créer un compte</h1>
            <span>Renseigne tes informations</span>
            <input
              type="text"
              name="name"
              placeholder="Nom"
              value={registerData.name}
              onChange={handleRegisterChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe (6 caractères minimum)"
              value={registerData.password}
              onChange={handleRegisterChange}
              minLength={6}
              required
            />
            {isSignUp && error && <p className="message erreur">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Patiente..." : "S'inscrire"}
            </button>
            <p className="mobile-switch">
              Déjà un compte ?
              <button type="button" onClick={() => switchMode(false)}>
                Se connecter
              </button>
            </p>
          </form>
        </div>

        {/* Formulaire de connexion */}
        <div className="form-container sign-in">
          <form onSubmit={handleLogin}>
            <img src={logo} alt="SagaTask" className="auth-logo" />
            <h1>Connexion</h1>
            <span>Utilise ton email et ton mot de passe</span>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={loginData.email}
              onChange={handleLoginChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={loginData.password}
              onChange={handleLoginChange}
              required
            />
            {!isSignUp && success && <p className="message succes">{success}</p>}
            {!isSignUp && error && <p className="message erreur">{error}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "Patiente..." : "Se connecter"}
            </button>
            <p className="mobile-switch">
              Pas encore de compte ?
              <button type="button" onClick={() => switchMode(true)}>
                S'inscrire
              </button>
            </p>
          </form>
        </div>

        {/* Panneau noir qui glisse */}
        <div className="toggle-container">
          <div className="toggle">
            <div className="toggle-panel toggle-left">
              <h1>Content de te revoir !</h1>
              <p>Connecte-toi pour retrouver toutes tes tâches.</p>
              <button
                type="button"
                className="ghost"
                onClick={() => switchMode(false)}
              >
                Se connecter
              </button>
            </div>
            <div className="toggle-panel toggle-right">
              <h1>Bienvenue !</h1>
              <p>Crée ton compte pour organiser tes journées.</p>
              <button
                type="button"
                className="ghost"
                onClick={() => switchMode(true)}
              >
                S'inscrire
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;