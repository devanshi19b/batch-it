import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div className="flex justify-between p-4 bg-black text-white">
      <h2>BatchIt 🍔</h2>
      <div className="space-x-4">
        <Link to="/home">Home</Link>
        <Link to="/orders">Orders 📦</Link>
        <Link to="/profile">Profile 👤</Link>
      </div>
    </div>
  );
};

export default Navbar;