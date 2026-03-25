import { useEffect, useState } from "react";
import { getOrders } from "../api/orderApi";
import Navbar from "../components/Navbar";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders().then((res) => setOrders(res.data));
  }, []);

  return (
    <div>
      <Navbar />
      <h2 className="p-4">Order History 📦</h2>

      {orders.map((order) => (
        <div key={order._id} className="border m-2 p-2">
          <p>Status: {order.status} 🚀</p>
          <p>Total: ₹{order.total}</p>
        </div>
      ))}
    </div>
  );
};

export default Orders;