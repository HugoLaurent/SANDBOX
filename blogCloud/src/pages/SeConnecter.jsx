import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SeConnecter.css";

export default function SeConnecter() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.email, password: form.password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur de connexion");
      }

      localStorage.setItem("token", data.token);
      setMessage("✅ Connexion réussie !");
      setTimeout(() => {
        navigate("/"); // redirection après login
      }, 1000);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>🔐 Connexion</h2>

        <input
          type="email"
          name="email"
          placeholder="Adresse e-mail"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Se connecter</button>

        {message && <p className="login-message">{message}</p>}

        <p className="login-hint">
          Pas encore inscrit ? <Link to="/register">Créer un compte</Link>
        </p>
      </form>
    </div>
  );
}
