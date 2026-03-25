import Navbar from "../components/Navbar";
import FoodCard from "../components/FoodCard";

const dummyFood = [
  { name: "Pizza", price: 200, image: "https://source.unsplash.com/400x300/?pizza" },
  { name: "Burger", price: 150, image: "https://source.unsplash.com/400x300/?burger" },
];

const Home = () => {
  return (
    <div>
      <Navbar />
      <div className="grid grid-cols-2 gap-4 p-4">
        {dummyFood.map((item, i) => (
          <FoodCard key={i} item={item} />
        ))}
      </div>
    </div>
  );
};

export default Home;