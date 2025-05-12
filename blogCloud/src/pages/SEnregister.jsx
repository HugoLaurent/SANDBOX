import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./SEnregister.css";

export default function SEnregister() {
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (form.password !== form.confirm) {
      setMessage("❌ Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      setMessage("✅ Compte créé avec succès !");
      setTimeout(() => {
        navigate("/login"); // redirection vers la page de connexion
      }, 1000);
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>📝 Créer un compte</h2>

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

        <input
          type="password"
          name="confirm"
          placeholder="Confirmer le mot de passe"
          value={form.confirm}
          onChange={handleChange}
          required
        />

        <button type="submit">S'enregistrer</button>

        {message && <p className="register-message">{message}</p>}

        <p className="register-hint">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}
