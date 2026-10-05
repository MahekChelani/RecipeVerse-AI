import { useState } from "react";

function PreferencesPanel() {
  const [preferences, setPreferences] = useState({
    cuisine: "Indian",
    meal: "Dinner",
    diet: "Vegetarian",
    spice: "Medium",
    servings: 2,
    time: "Under 45 minutes",
  });

  const update = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <section className="bg-white px-6 py-14 md:py-20">
      <div className="max-w-7xl mx-auto">

        <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-3xl p-6 md:p-10 shadow-sm">

          <div className="text-center mb-8">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-wider">
              Smart Recommendations
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Personalize Your Recipes
            </h2>

            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              Tell RecipeVerse what you like and discover recipes that match
              your taste, diet and available cooking time.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cuisine
              </label>

              <select
                value={preferences.cuisine}
                onChange={(e) => update("cuisine", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option>Indian</option>
                <option>Italian</option>
                <option>Japanese</option>
                <option>Mexican</option>
                <option>Thai</option>
                <option>French</option>
                <option>Middle Eastern</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Meal Type
              </label>

              <select
                value={preferences.meal}
                onChange={(e) => update("meal", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
                <option>Snacks</option>
                <option>Dessert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Dietary Preference
              </label>

              <select
                value={preferences.diet}
                onChange={(e) => update("diet", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option>Vegetarian</option>
                <option>Non-Vegetarian</option>
                <option>Vegan</option>
                <option>Gluten Free</option>
                <option>High Protein</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Spice Level
              </label>

              <div className="grid grid-cols-3 gap-2">
                {["Mild", "Medium", "Spicy"].map((level) => (
                  <button
                    key={level}
                    onClick={() => update("spice", level)}
                    className={`py-3 rounded-xl text-sm font-semibold transition ${
                      preferences.spice === level
                        ? "bg-orange-500 text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:border-orange-300"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Servings
              </label>

              <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() =>
                    update(
                      "servings",
                      Math.max(1, preferences.servings - 1)
                    )
                  }
                  className="px-5 py-3 text-xl hover:bg-orange-50"
                >
                  −
                </button>

                <span className="flex-1 text-center font-bold">
                  {preferences.servings}
                </span>

                <button
                  onClick={() =>
                    update("servings", preferences.servings + 1)
                  }
                  className="px-5 py-3 text-xl hover:bg-orange-50"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cooking Time
              </label>

              <select
                value={preferences.time}
                onChange={(e) => update("time", e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option>Under 15 minutes</option>
                <option>Under 30 minutes</option>
                <option>Under 45 minutes</option>
                <option>Under 60 minutes</option>
                <option>Any time</option>
              </select>
            </div>

          </div>

          <div className="mt-7 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-4 border border-gray-100">

            <div>
              <p className="font-semibold text-gray-900">
                Your preferences are ready
              </p>

              <p className="text-sm text-gray-500">
                {preferences.cuisine} · {preferences.meal} ·{" "}
                {preferences.diet} · {preferences.servings} servings
              </p>
            </div>

            <button className="w-full sm:w-auto bg-gray-900 text-white px-7 py-3 rounded-xl font-semibold hover:bg-orange-500 transition">
              Apply Preferences
            </button>

          </div>

        </div>
      </div>
    </section>
  );
}

export default PreferencesPanel;