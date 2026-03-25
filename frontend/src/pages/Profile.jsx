import { useEffect, useState } from "react";
import { getOrders } from "../api/orderApi";
import Navbar from "../components/Navbar";
import calcMonthly from "../utils/calculateMonthlySpend";

const Profile = () => {
  const [orders, setOrders] = useState([]);
  const [monthly, setMonthly] = useState(0);

  useEffect(() => {
    getOrders().then((res) => {
      setOrders(res.data);
      setMonthly(calcMonthly(res.data));
    });
  }, []);

  return (
    <div>
      <Navbar />
      <h2 className="p-4">Profile 👤</h2>

      <p className="p-2">Total Orders: {orders.length}</p>
      <p className="p-2">This Month Spend: ₹{monthly} 💸</p>
    </div>
  );
};

export default Profile;