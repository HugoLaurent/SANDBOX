import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Home.css";

function App() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: "", content: "" });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // décode le JWT
      setUser(payload);
    } catch {
      localStorage.removeItem("token");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate(0); // recharge la page
  };

  const fetchPosts = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/posts`);
    const data = await res.json();
    setPosts(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Veuillez vous connecter pour publier.");
      return;
    }

    await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    setForm({ title: "", content: "" });
    fetchPosts();
  };

  return (
    <div className="container">
      <h1>✨ My Mini Blog</h1>

      <div className="auth-buttons">
        {user ? (
          <>
            <span>
              👋 Connecté en tant que <strong>{user.username}</strong>
            </span>
            <button onClick={handleLogout}>🚪 Se déconnecter</button>
          </>
        ) : (
          <>
            <Link to="/login">🔐 Se connecter</Link> |{" "}
            <Link to="/register">📝 S'enregistrer</Link>
          </>
        )}
      </div>

      {user && (
        <form className="blog-form" onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Titre stylé..."
            value={form.title}
            onChange={handleChange}
          />
          <textarea
            name="content"
            placeholder="Dis quelque chose de cool..."
            value={form.content}
            onChange={handleChange}
          />
          <button type="submit">Publier 🚀</button>
        </form>
      )}

      <div className="posts">
        {posts.map((post) => (
          <div key={post._id} className="post-card">
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <div className="post-meta">
              <small>
                ✍️ {post.author || "Anonyme"} · 🕒{" "}
                {new Date(post.createdAt).toLocaleString("fr-FR")}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
