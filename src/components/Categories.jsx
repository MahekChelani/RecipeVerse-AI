import { useState } from "react";

const categories = [
  {
    name: "Breakfast",
    image:
      "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Main Course",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Street Food",
    image:
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Salads",
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Desserts",
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=85",
  },
  {
    name: "Beverages",
    image:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=700&q=85",
  },
];

function Categories() {
  const [selectedCategory, setSelectedCategory] = useState("");

  return (
    <section id="categories" className="bg-white py-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-orange-500 font-bold uppercase tracking-wider text-sm">
              Browse by type
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Explore Categories
            </h2>

            <p className="text-gray-500 mt-2">
              Find something delicious for every mood and occasion.
            </p>
          </div>
        </div>

        {/* CATEGORY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`group relative h-36 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                selectedCategory === category.name
                  ? "ring-4 ring-orange-400 shadow-xl"
                  : ""
              }`}
            >
              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />

              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition" />

              <span className="relative z-10 h-full flex items-end p-4 text-white font-bold text-left">
                {category.name}
              </span>
            </button>
          ))}
        </div>

        {/* SELECTED CATEGORY */}
        {selectedCategory && (
          <div className="mt-8 bg-orange-50 border border-orange-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-orange-500 font-semibold">
                Selected Category
              </p>

              <h3 className="text-2xl font-bold text-gray-900">
                {selectedCategory}
              </h3>
            </div>

            <button
              onClick={() => setSelectedCategory("")}
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition"
            >
              Clear Selection
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

export default Categories;