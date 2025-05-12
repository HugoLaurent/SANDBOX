import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";

function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    checkAuth();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser(payload);
    } catch {
      localStorage.removeItem("token");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate(0);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Erreur lors du chargement des produits", err);
    }
  };

  const updateCart = useCallback((updater) => {
    setCart((prevCart) => {
      const newCart =
        typeof updater === "function" ? updater(prevCart) : updater;
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  }, []);

  const addToCart = (product) => {
    updateCart((prevCart) => {
      const existing = prevCart.find((item) => item._id === product._id);
      return existing
        ? prevCart.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    updateCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
    } else {
      updateCart((prevCart) =>
        prevCart.map((item) =>
          item._id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (!user) {
      return navigate("/login");
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          products: cart.map((item) => ({
            productId: item._id,
            quantity: item.quantity,
          })),
        }),
      });

      const order = await res.json();
      if (res.ok) {
        updateCart([]);
        setIsCartOpen(false);
        navigate(`/orders/${order._id}`);
      } else {
        console.error("Erreur lors de la commande :", order.error);
      }
    } catch (err) {
      console.error("Erreur checkout :", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="text-2xl font-bold text-indigo-600">E-Shop</div>
            <div className="flex items-center space-x-4">
              {!user ? (
                <>
                  <Link to="/login" className="text-indigo-600 hover:underline">
                    Connexion
                  </Link>
                  <Link
                    to="/register"
                    className="text-indigo-600 hover:underline"
                  >
                    Inscription
                  </Link>
                </>
              ) : (
                <button
                  onClick={handleLogout}
                  className="text-red-500 hover:underline"
                >
                  Déconnexion
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative text-gray-700 hover:text-indigo-600"
              >
                <ShoppingCart className="h-6 w-6" />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                    {cart.reduce((t, item) => t + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main
        className={`max-w-7xl mx-auto px-4 pt-24 pb-12 ${
          isCartOpen ? "blur-sm" : ""
        }`}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Nos Produits</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-600 font-bold text-xl">
                    {product.price.toFixed(2)} €
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Panel */}
      <div
        className={`fixed top-0 right-0 w-96 h-full bg-white shadow-xl z-40 transition-transform ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold">Panier</h2>
            <button onClick={() => setIsCartOpen(false)}>✕</button>
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500">Votre panier est vide</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center bg-gray-100 p-4 rounded"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-bold">{item.name}</h4>
                      <p className="text-gray-600">{item.price.toFixed(2)} €</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity - 1)
                      }
                      className="bg-gray-200 p-1 rounded-full"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                      className="bg-gray-200 p-1 rounded-full"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="ml-2 text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 border-t">
              <div className="flex justify-between mb-4">
                <span className="font-bold">Total</span>
                <span className="text-indigo-600 font-bold">
                  {calculateTotal().toFixed(2)} €
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-indigo-500 text-white py-3 rounded-md hover:bg-indigo-600"
              >
                Procéder au paiement
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
          onClick={() => setIsCartOpen(false)}
        />
      )}
    </div>
  );
}

export default Home;
