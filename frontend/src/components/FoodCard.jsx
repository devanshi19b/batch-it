const FoodCard = ({ item }) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-3">
      <img src={item.image} className="h-40 w-full rounded-lg" />
      <h3>{item.name} 🍕</h3>
      <p>₹{item.price}</p>
      <button className="bg-green-500 text-white px-3 py-1 rounded">
        Add 🛒
      </button>
    </div>
  );
};

export default FoodCard;