import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrder();
  }, []);

  const fetchOrder = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const allOrders = await res.json();

      const found = allOrders.find((o) => o._id === id);
      if (!found) {
        console.warn("Commande non trouvée");
        return;
      }

      const enrichedProducts = await Promise.all(
        found.products.map(async ({ productId, quantity }) => {
          const productRes = await fetch(
            `${import.meta.env.VITE_API_URL}/products`
          );
          const allProducts = await productRes.json();
          const product = allProducts.find((p) => p._id === productId);
          return {
            ...product,
            quantity,
          };
        })
      );

      setOrder({
        ...found,
        items: enrichedProducts,
      });
    } catch (err) {
      console.error("Erreur lors du chargement de la commande :", err);
    }
  };

  if (!order) return <div className="p-10 text-gray-700">Chargement...</div>;

  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-3xl font-bold text-indigo-600 mb-6">
        Commande #{order._id}
      </h1>
      <p className="mb-2 text-gray-600">
        Passée le : {new Date(order.createdAt).toLocaleString()}
      </p>
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Données brutes :
        </h2>
        <pre className="bg-gray-100 p-4 rounded text-sm text-gray-700 overflow-x-auto">
          {JSON.stringify(order, null, 2)}
        </pre>
      </div>
      <div className="border-t pt-6 space-y-4">
        {order.items.map((item) => (
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
                <p className="text-sm text-gray-500">
                  {item.price.toFixed(2)} € × {item.quantity}
                </p>
              </div>
            </div>
            <div className="font-bold text-indigo-600">
              {(item.price * item.quantity).toFixed(2)} €
            </div>
          </div>
        ))}
        <div className="flex justify-end text-xl font-bold text-indigo-700 pt-4">
          Total :{" "}
          {order.items
            .reduce((sum, item) => sum + item.price * item.quantity, 0)
            .toFixed(2)}{" "}
          €
        </div>
      </div>
    </div>
  );
}
