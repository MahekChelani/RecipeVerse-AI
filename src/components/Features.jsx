import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const features = [
  {
    title: "AI Voice Assistant",
    description:
      "Follow recipe instructions in an interactive, text-based cooking guide. Speech recognition is not enabled.",
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Camera Cooking Assistant",
    description:
      "Preview a kitchen photo and enter ingredients manually. Automatic image recognition is not enabled.",
    image:
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Smart Ingredient Scanner",
    description:
      "Enter ingredients to find matching recipes in the available recipe catalog.",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "AI Meal Planner",
    description:
      "Create a simple meal plan from the available recipes and your selected preferences.",
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=700&q=85",
  },
];

function getIngredientName(ingredient) {
  if (Array.isArray(ingredient)) return String(ingredient[0] || "");
  return String(ingredient || "").split(" - ")[0];
}

function findMatchingRecipes(recipes, input) {
  const searchTerms = input
    .split(",")
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);

  if (searchTerms.length === 0) return [];

  return recipes
    .map((recipe) => {
      const ingredientNames = (recipe.ingredients || []).map((ingredient) =>
        getIngredientName(ingredient).toLowerCase()
      );
      const matchedIngredients = searchTerms.filter((term) =>
        ingredientNames.some((name) => name.includes(term))
      );

      return { recipe, matchedIngredients };
    })
    .filter((result) => result.matchedIngredients.length > 0)
    .sort(
      (left, right) =>
        right.matchedIngredients.length - left.matchedIngredients.length
    );
}

function Features({ onSearch }) {
  const recipes = useSelector((state) => state.recipe?.recipes || []);
  const [activeFeature, setActiveFeature] = useState(null);
  const [selectedRecipeName, setSelectedRecipeName] = useState("");
  const [guideStep, setGuideStep] = useState(0);
  const [ingredientInput, setIngredientInput] = useState("");
  const [ingredientMatches, setIngredientMatches] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [plannerDays, setPlannerDays] = useState("3");
  const [plannerMeal, setPlannerMeal] = useState("");
  const [plannerServings, setPlannerServings] = useState("2");
  const [mealPlan, setMealPlan] = useState(null);
  const [plannerMessage, setPlannerMessage] = useState("");

  useEffect(
    () => () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    },
    [imageUrl]
  );

  const guideRecipe = recipes.find(
    (recipe) => recipe.name === selectedRecipeName
  );

  const closeFeature = () => setActiveFeature(null);

  const openRecipeInExplorer = (recipe) => {
    onSearch?.(recipe.name);
    closeFeature();
    requestAnimationFrame(() =>
      document.getElementById("recipes")?.scrollIntoView({ behavior: "smooth" })
    );
  };

  const searchIngredients = (event) => {
    event.preventDefault();
    setIngredientMatches(findMatchingRecipes(recipes, ingredientInput));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
  };

  const createMealPlan = (event) => {
    event.preventDefault();
    const matchingRecipes = recipes.filter(
      (recipe) =>
        !plannerMeal ||
        String(recipe.meal || "").toLowerCase() === plannerMeal.toLowerCase()
    );

    if (matchingRecipes.length === 0) {
      setMealPlan(null);
      setPlannerMessage(
        plannerMeal
          ? `No ${plannerMeal.toLowerCase()} recipes are available in the catalog. Try another meal type.`
          : "No recipes are currently available in the catalog."
      );
      return;
    }

    const days = Number(plannerDays);
    setMealPlan(
      Array.from({ length: days }, (_, index) => ({
        day: index + 1,
        recipe: matchingRecipes[index % matchingRecipes.length],
      }))
    );
    setPlannerMessage("");
  };

  const renderRecipeMatches = (matches) => {
    if (matches.length === 0) {
      return (
        <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
          No recipes matched those ingredients. Try broader ingredient names.
        </p>
      );
    }

    return (
      <ul className="mt-4 space-y-3">
        {matches.slice(0, 5).map(({ recipe, matchedIngredients }) => (
          <li
            key={recipe._id || recipe.name}
            className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-bold text-gray-900">{recipe.name}</p>
              <p className="mt-1 text-sm text-gray-600">
                Matches: {matchedIngredients.join(", ")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => openRecipeInExplorer(recipe)}
              className="shrink-0 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Open recipe
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section id="features" className="bg-gray-900 px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-orange-400">
            Cook Smarter
          </p>
          <h2 className="mt-3 text-4xl font-bold text-white md:text-5xl">
            Powerful Features
          </h2>
          <p className="mt-4 text-lg leading-7 text-gray-400">
            Practical recipe tools to help with planning, discovering and
            cooking.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 hover:shadow-2xl"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={feature.image}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 leading-7 text-gray-400">
                  {feature.description}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveFeature(feature.title)}
                  className="mt-5 font-semibold text-orange-400 transition hover:text-orange-300"
                >
                  Explore feature →
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {activeFeature && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/60 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeFeature();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feature-dialog-title"
            className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-orange-600">
                  Interactive demo
                </p>
                <h2
                  id="feature-dialog-title"
                  className="mt-2 text-2xl font-bold text-gray-900"
                >
                  {activeFeature}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close feature demo"
                onClick={closeFeature}
                className="rounded-lg px-3 py-1 text-2xl leading-none text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                ×
              </button>
            </div>

            {activeFeature === "AI Voice Assistant" && (
              <div className="mt-6">
                <p className="text-sm leading-6 text-gray-600">
                  Choose a recipe to follow its existing instructions one step
                  at a time. This is a text guide; speech recognition and voice
                  playback are not enabled.
                </p>
                {recipes.length > 0 ? (
                  <>
                    <label
                      htmlFor="guide-recipe"
                      className="mt-5 block text-sm font-semibold text-gray-800"
                    >
                      Recipe
                    </label>
                    <select
                      id="guide-recipe"
                      value={selectedRecipeName}
                      onChange={(event) => {
                        setSelectedRecipeName(event.target.value);
                        setGuideStep(0);
                      }}
                      className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900"
                    >
                      <option value="">Choose a recipe</option>
                      {recipes.map((recipe) => (
                        <option
                          key={recipe._id || recipe.name}
                          value={recipe.name}
                        >
                          {recipe.name}
                        </option>
                      ))}
                    </select>
                    {guideRecipe?.instructions?.length > 0 && (
                      <div className="mt-5 rounded-xl bg-orange-50 p-5">
                        <p className="text-sm font-semibold text-orange-700">
                          Step {guideStep + 1} of {guideRecipe.instructions.length}
                        </p>
                        <p className="mt-2 text-lg leading-7 text-gray-900">
                          {guideRecipe.instructions[guideStep]}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-3">
                          <button
                            type="button"
                            disabled={guideStep === 0}
                            onClick={() => setGuideStep((step) => step - 1)}
                            className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            type="button"
                            disabled={guideStep === guideRecipe.instructions.length - 1}
                            onClick={() => setGuideStep((step) => step + 1)}
                            className="rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Next step
                          </button>
                        </div>
                      </div>
                    )}
                    {selectedRecipeName && !guideRecipe?.instructions?.length && (
                      <p className="mt-4 text-sm text-gray-600">
                        This recipe has no step-by-step instructions in the
                        catalog.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                    Recipes are not loaded. Start the recipe API and load the
                    catalog to use this guide.
                  </p>
                )}
              </div>
            )}

            {activeFeature === "Camera Cooking Assistant" && (
              <div className="mt-6">
                <p className="text-sm leading-6 text-gray-600">
                  Select or take a kitchen photo for an in-browser preview,
                  then enter any ingredients you want to search for. The photo
                  is not uploaded or analyzed.
                </p>
                <label
                  htmlFor="kitchen-photo"
                  className="mt-5 block text-sm font-semibold text-gray-800"
                >
                  Choose a kitchen photo
                </label>
                <input
                  id="kitchen-photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="mt-2 block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:font-semibold file:text-orange-800 hover:file:bg-orange-200"
                />
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Selected kitchen photo preview"
                    className="mt-4 max-h-64 w-full rounded-xl bg-gray-100 object-contain"
                  />
                )}
                <form onSubmit={searchIngredients} className="mt-5">
                  <label
                    htmlFor="camera-ingredients"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Ingredients you can see (comma-separated)
                  </label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      id="camera-ingredients"
                      value={ingredientInput}
                      onChange={(event) => setIngredientInput(event.target.value)}
                      placeholder="e.g. tomatoes, rice"
                      className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-3 text-gray-900"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                    >
                      Find recipe ideas
                    </button>
                  </div>
                </form>
                {ingredientMatches !== null &&
                  renderRecipeMatches(ingredientMatches)}
              </div>
            )}

            {activeFeature === "Smart Ingredient Scanner" && (
              <div className="mt-6">
                <p className="text-sm leading-6 text-gray-600">
                  Enter one or more ingredients to find recipes with matching
                  ingredient names. This catalog search does not use image
                  recognition.
                </p>
                <form onSubmit={searchIngredients} className="mt-5">
                  <label
                    htmlFor="scanner-ingredients"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Ingredients (comma-separated)
                  </label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      id="scanner-ingredients"
                      value={ingredientInput}
                      onChange={(event) => setIngredientInput(event.target.value)}
                      placeholder="e.g. chickpeas, tomatoes"
                      className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-3 text-gray-900"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                    >
                      Search recipes
                    </button>
                  </div>
                </form>
                {ingredientMatches !== null &&
                  renderRecipeMatches(ingredientMatches)}
                {recipes.length === 0 && (
                  <p className="mt-4 text-sm text-gray-600">
                    Start the recipe API and load the catalog before searching.
                  </p>
                )}
              </div>
            )}

            {activeFeature === "AI Meal Planner" && (
              <div className="mt-6">
                <p className="text-sm leading-6 text-gray-600">
                  Build a simple plan using recipes already in the catalog. No
                  external AI or nutrition analysis is used.
                </p>
                <form
                  onSubmit={createMealPlan}
                  className="mt-5 grid gap-4 sm:grid-cols-3"
                >
                  <div>
                    <label
                      htmlFor="planner-days"
                      className="block text-sm font-semibold text-gray-800"
                    >
                      Plan length
                    </label>
                    <select
                      id="planner-days"
                      value={plannerDays}
                      onChange={(event) => setPlannerDays(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900"
                    >
                      <option value="3">3 days</option>
                      <option value="5">5 days</option>
                      <option value="7">7 days</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="planner-meal"
                      className="block text-sm font-semibold text-gray-800"
                    >
                      Meal type
                    </label>
                    <select
                      id="planner-meal"
                      value={plannerMeal}
                      onChange={(event) => setPlannerMeal(event.target.value)}
                      className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900"
                    >
                      <option value="">Any meal</option>
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="planner-servings"
                      className="block text-sm font-semibold text-gray-800"
                    >
                      Servings
                    </label>
                    <input
                      id="planner-servings"
                      type="number"
                      min="1"
                      max="20"
                      value={plannerServings}
                      onChange={(event) =>
                        setPlannerServings(event.target.value)
                      }
                      className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600 sm:col-span-3"
                  >
                    Create meal plan
                  </button>
                </form>
                {plannerMessage && (
                  <p role="status" className="mt-4 text-sm text-amber-800">
                    {plannerMessage}
                  </p>
                )}
                {mealPlan && (
                  <ol className="mt-5 space-y-3">
                    {mealPlan.map(({ day, recipe }) => (
                      <li
                        key={day}
                        className="flex flex-col gap-2 rounded-xl bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-bold text-gray-900">
                            Day {day}: {recipe.name}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            {recipe.meal || "Meal"} · {plannerServings} servings
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openRecipeInExplorer(recipe)}
                          className="self-start font-semibold text-orange-700 hover:text-orange-900 sm:self-auto"
                        >
                          Open recipe →
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
                {recipes.length === 0 && (
                  <p className="mt-4 text-sm text-gray-600">
                    Start the recipe API and load the catalog before creating a
                    meal plan.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default Features;
