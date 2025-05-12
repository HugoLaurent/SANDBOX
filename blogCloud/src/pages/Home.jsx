import { useState, useEffect, useCallback } from "react";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";

function Home() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() => {
    // Initialiser le panier depuis le localStorage au premier chargement
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fonction de mise à jour du panier qui met à jour également le localStorage
  const updateCart = useCallback((updater) => {
    setCart((prevCart) => {
      // Utiliser une fonction pour mettre à jour le panier
      const newCart =
        typeof updater === "function" ? updater(prevCart) : updater;

      // Mettre à jour le localStorage
      localStorage.setItem("cart", JSON.stringify(newCart));
      return newCart;
    });
  }, []);

  useEffect(() => {
    // Charger les produits au montage du composant
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Erreur lors du chargement des produits", error);
    }
  };

  const addToCart = (product) => {
    updateCart((prevCart) => {
      // Vérifier si le produit existe déjà dans le panier
      const existingProduct = prevCart.find((item) => item._id === product._id);

      if (existingProduct) {
        // Si le produit existe, augmenter la quantité
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Si le produit n'existe pas, l'ajouter avec une quantité de 1
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    updateCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateCart((prevCart) =>
        prevCart.map((item) =>
          item._id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="text-2xl font-bold text-indigo-600">E-Shop</div>

            <button
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative text-gray-700 hover:text-indigo-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <main
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 ${
          isCartOpen ? "blur-sm" : ""
        }`}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Nos Produits</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-indigo-600 font-bold text-xl">
                    {product.price.toFixed(2)} €
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Panier latéral */}
      <div
        className={`
          fixed top-0 right-0 w-96 h-full bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out
          ${isCartOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Entête du panier */}
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">Panier</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>

          {/* Liste des produits du panier */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500">Votre panier est vide</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between bg-gray-100 p-4 rounded-lg"
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
                      className="bg-gray-200 rounded-full p-1"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item._id, item.quantity + 1)
                      }
                      className="bg-gray-200 rounded-full p-1"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pied de page du panier */}
          {cart.length > 0 && (
            <div className="p-6 border-t">
              <div className="flex justify-between mb-4">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-indigo-600 font-bold">
                  {calculateTotal().toFixed(2)} €
                </span>
              </div>
              <button className="w-full bg-indigo-500 text-white py-3 rounded-md hover:bg-indigo-600 transition-colors">
                Procéder au paiement
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay semi-transparent quand le panier est ouvert */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-opacity-50 z-30"
          onClick={() => setIsCartOpen(false)}
        ></div>
      )}
    </div>
  );
}

export default Home;
