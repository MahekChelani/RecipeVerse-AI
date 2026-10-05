import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";

import {
  toggleFavorite,
  selectRecipe,
  clearSelectedRecipe,
  increaseServings,
  decreaseServings,
  setRecipeCatalog,
} from "../redux/recipeSlice";
import { prepareRecipe } from "../utils/recipeData";
import {
  filterRecipes,
  getRecipeCategories,
  getRecipeContinent,
} from "../utils/recipeExplorer";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/recipes`;

const recipes_DEPRECATED = [
  {
    name: "Butter Chicken",
    category: "Indian",
    country: "India",
    continent: "Asia",
    meal: "Dinner",
    rating: "4.9",
    time: "45 min",
    servings: 4,
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1000&q=85",
    description:
      "Creamy tomato-based Indian chicken curry with butter and aromatic spices.",
    ingredients: [
      ["Chicken", 500, "g"],
      ["Butter", 3, "tbsp"],
      ["Tomato puree", 1, "cup"],
      ["Cream", 0.5, "cup"],
      ["Onion", 1, "medium"],
      ["Garam masala", 1, "tsp"],
      ["Ginger-garlic paste", 1, "tbsp"],
      ["Salt", 1, "tsp"],
    ],
    instructions: [
      "Marinate the chicken with yogurt and spices.",
      "Cook the chicken until lightly browned.",
      "Sauté onion and ginger-garlic paste.",
      "Add tomato puree and spices.",
      "Add chicken and simmer.",
      "Finish with cream and garam masala.",
    ],
    substitutions: [
      ["Chicken", "Paneer", "Tofu"],
      ["Butter", "Ghee", "Olive oil"],
      ["Cream", "Coconut cream", "Greek yogurt"],
    ],
  },

  {
    name: "Masala Dosa",
    category: "Indian",
    country: "India",
    continent: "Asia",
    meal: "Breakfast",
    rating: "4.8",
    time: "35 min",
    servings: 4,
    image:
      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1000&q=85",
    description:
      "Crispy South Indian rice-and-lentil crepe filled with spiced potato masala.",
    ingredients: [
      ["Dosa batter", 4, "cups"],
      ["Potatoes", 500, "g"],
      ["Onion", 1, "large"],
      ["Green chilli", 2, "pieces"],
      ["Mustard seeds", 1, "tsp"],
      ["Turmeric", 0.5, "tsp"],
      ["Oil", 2, "tbsp"],
    ],
    instructions: [
      "Prepare the potato masala.",
      "Heat a dosa pan.",
      "Spread batter into a thin circle.",
      "Drizzle oil around the edges.",
      "Add potato masala.",
      "Fold and serve with chutney and sambar.",
    ],
    substitutions: [
      ["Potatoes", "Sweet potato", "Paneer"],
      ["Dosa batter", "Ragi batter", "Oats batter"],
      ["Oil", "Ghee", "Coconut oil"],
    ],
  },

  {
    name: "Biryani",
    category: "Indian",
    country: "India",
    continent: "Asia",
    meal: "Lunch",
    rating: "4.9",
    time: "60 min",
    servings: 4,
    image:
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1000&q=85",
    description:
      "Fragrant layered rice dish cooked with aromatic spices and seasoned protein.",
    ingredients: [
      ["Basmati rice", 400, "g"],
      ["Chicken", 500, "g"],
      ["Onion", 2, "large"],
      ["Yogurt", 1, "cup"],
      ["Ginger-garlic paste", 2, "tbsp"],
      ["Biryani masala", 2, "tbsp"],
      ["Saffron", 1, "pinch"],
    ],
    instructions: [
      "Wash and partially cook the basmati rice.",
      "Marinate and cook the chicken with spices.",
      "Layer rice over the chicken.",
      "Add fried onions and saffron.",
      "Cover tightly and cook on low heat.",
      "Rest before serving.",
    ],
    substitutions: [
      ["Chicken", "Paneer", "Mixed vegetables"],
      ["Basmati rice", "Sella rice", "Brown rice"],
      ["Yogurt", "Coconut yogurt", "Plant yogurt"],
    ],
  },

  {
    name: "Margherita Pizza",
    category: "Italian",
    country: "Italy",
    continent: "Europe",
    meal: "Lunch",
    rating: "4.8",
    time: "30 min",
    servings: 4,
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1000&q=85",
    description:
      "Classic Italian pizza with tomato, mozzarella and fresh basil.",
    ingredients: [
      ["Pizza dough", 1, "large"],
      ["Tomato sauce", 1, "cup"],
      ["Mozzarella", 200, "g"],
      ["Fresh basil", 10, "leaves"],
      ["Olive oil", 2, "tbsp"],
    ],
    instructions: [
      "Preheat oven to 230°C.",
      "Roll the dough.",
      "Spread tomato sauce.",
      "Add mozzarella and basil.",
      "Drizzle olive oil.",
      "Bake for 10–15 minutes.",
    ],
    substitutions: [
      ["Mozzarella", "Burrata", "Provolone"],
      ["Basil", "Oregano", "Parsley"],
      ["Pizza dough", "Flatbread", "Naan"],
    ],
  },

  {
    name: "Ramen",
    category: "Japanese",
    country: "Japan",
    continent: "Asia",
    meal: "Lunch",
    rating: "4.8",
    time: "40 min",
    servings: 4,
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=85",
    description:
      "Japanese noodle soup with rich broth, vegetables and delicious toppings.",
    ingredients: [
      ["Ramen noodles", 400, "g"],
      ["Broth", 1, "L"],
      ["Soy sauce", 4, "tbsp"],
      ["Eggs", 4, "pieces"],
      ["Spring onion", 3, "pieces"],
      ["Mushrooms", 200, "g"],
    ],
    instructions: [
      "Prepare the broth.",
      "Cook the ramen noodles.",
      "Prepare boiled eggs.",
      "Sauté mushrooms.",
      "Combine noodles and broth.",
      "Add toppings and serve.",
    ],
    substitutions: [
      ["Ramen noodles", "Udon", "Soba"],
      ["Eggs", "Tofu", "Corn"],
      ["Mushrooms", "Spinach", "Bok choy"],
    ],
  },

  {
    name: "Tacos al Pastor",
    category: "Mexican",
    country: "Mexico",
    continent: "Americas",
    meal: "Dinner",
    rating: "4.9",
    time: "35 min",
    servings: 4,
    image:
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?auto=format&fit=crop&w=1000&q=85",
    description:
      "Mexican tacos filled with seasoned meat, pineapple and fresh toppings.",
    ingredients: [
      ["Tortillas", 8, "pieces"],
      ["Chicken", 400, "g"],
      ["Pineapple", 1, "cup"],
      ["Onion", 1, "medium"],
      ["Cilantro", 0.5, "cup"],
      ["Lime", 2, "pieces"],
    ],
    instructions: [
      "Season the chicken.",
      "Cook until browned.",
      "Warm the tortillas.",
      "Add chicken and pineapple.",
      "Top with onion and cilantro.",
      "Finish with fresh lime.",
    ],
    substitutions: [
      ["Chicken", "Beans", "Tofu"],
      ["Tortillas", "Lettuce cups", "Corn tortillas"],
      ["Pineapple", "Mango", "Peach"],
    ],
  },

  {
    name: "Pad Thai",
    category: "Thai",
    country: "Thailand",
    continent: "Asia",
    meal: "Dinner",
    rating: "4.8",
    time: "30 min",
    servings: 4,
    image:
      "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1000&q=85",
    description:
      "Thai stir-fried rice noodles with vegetables, peanuts and tangy sauce.",
    ingredients: [
      ["Rice noodles", 400, "g"],
      ["Eggs", 3, "pieces"],
      ["Bean sprouts", 1, "cup"],
      ["Peanuts", 0.5, "cup"],
      ["Soy sauce", 3, "tbsp"],
      ["Lime", 2, "pieces"],
    ],
    instructions: [
      "Soak the rice noodles.",
      "Prepare the sauce.",
      "Stir-fry vegetables.",
      "Add noodles and sauce.",
      "Add eggs and mix.",
      "Top with peanuts and lime.",
    ],
    substitutions: [
      ["Rice noodles", "Glass noodles", "Udon"],
      ["Peanuts", "Cashews", "Almonds"],
      ["Eggs", "Tofu", "Tempeh"],
    ],
  },

  {
    name: "Greek Salad",
    category: "Greek",
    country: "Greece",
    continent: "Europe",
    meal: "Lunch",
    rating: "4.7",
    time: "15 min",
    servings: 4,
    image:
      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1000&q=85",
    description:
      "Fresh Mediterranean salad with tomatoes, cucumber, olives and feta.",
    ingredients: [
      ["Tomatoes", 3, "medium"],
      ["Cucumber", 1, "large"],
      ["Feta", 150, "g"],
      ["Olives", 0.5, "cup"],
      ["Red onion", 1, "small"],
      ["Olive oil", 3, "tbsp"],
    ],
    instructions: [
      "Chop the vegetables.",
      "Add olives and onion.",
      "Crumble feta over the salad.",
      "Add olive oil.",
      "Season with herbs.",
      "Toss and serve fresh.",
    ],
    substitutions: [
      ["Feta", "Tofu feta", "Goat cheese"],
      ["Olives", "Capers", "Pickles"],
      ["Cucumber", "Zucchini", "Bell pepper"],
    ],
  },

  {
    name: "Falafel Bowl",
    category: "Middle Eastern",
    country: "Lebanon",
    continent: "Middle East",
    meal: "Lunch",
    rating: "4.7",
    time: "30 min",
    servings: 4,
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85",
    description:
      "Mediterranean bowl with crispy falafel, vegetables and creamy tahini.",
    ingredients: [
      ["Chickpeas", 400, "g"],
      ["Parsley", 0.5, "cup"],
      ["Garlic", 3, "cloves"],
      ["Tahini", 4, "tbsp"],
      ["Cucumber", 1, "medium"],
      ["Tomatoes", 2, "medium"],
    ],
    instructions: [
      "Blend chickpeas with herbs and spices.",
      "Shape the mixture into balls.",
      "Cook until golden.",
      "Prepare tahini sauce.",
      "Arrange vegetables in a bowl.",
      "Add falafel and sauce.",
    ],
    substitutions: [
      ["Chickpeas", "White beans", "Lentils"],
      ["Tahini", "Hummus", "Greek yogurt"],
      ["Parsley", "Cilantro", "Mint"],
    ],
  },

  {
    name: "Moroccan Tagine",
    category: "Moroccan",
    country: "Morocco",
    continent: "Africa",
    meal: "Dinner",
    rating: "4.8",
    time: "80 min",
    servings: 4,
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85",
    description:
      "Slow-cooked Moroccan stew with aromatic spices and vegetables.",
    ingredients: [
      ["Chicken", 600, "g"],
      ["Carrots", 3, "medium"],
      ["Potatoes", 400, "g"],
      ["Onion", 1, "large"],
      ["Cumin", 1, "tsp"],
      ["Cinnamon", 0.5, "tsp"],
    ],
    instructions: [
      "Sauté onion and spices.",
      "Add chicken and brown lightly.",
      "Add vegetables.",
      "Add a little water.",
      "Cover and slow cook.",
      "Serve with couscous or bread.",
    ],
    substitutions: [
      ["Chicken", "Chickpeas", "Lamb"],
      ["Potatoes", "Sweet potato", "Turnip"],
      ["Couscous", "Rice", "Flatbread"],
    ],
  },

  {
    name: "Paella",
    category: "Spanish",
    country: "Spain",
    continent: "Europe",
    meal: "Dinner",
    rating: "4.9",
    time: "65 min",
    servings: 4,
    image:
      "https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=1000&q=85",
    description:
      "Traditional Spanish rice dish cooked with vegetables and aromatic saffron.",
    ingredients: [
      ["Short-grain rice", 400, "g"],
      ["Bell peppers", 2, "medium"],
      ["Tomatoes", 2, "medium"],
      ["Saffron", 1, "pinch"],
      ["Vegetable stock", 800, "ml"],
      ["Olive oil", 3, "tbsp"],
    ],
    instructions: [
      "Sauté vegetables.",
      "Add rice and toast lightly.",
      "Add stock and saffron.",
      "Cook without stirring.",
      "Allow the bottom to become slightly crisp.",
      "Rest and serve.",
    ],
    substitutions: [
      ["Short-grain rice", "Arborio rice", "Brown rice"],
      ["Saffron", "Turmeric", "Paprika"],
      ["Vegetable stock", "Chicken stock", "Mushroom stock"],
    ],
  },

  {
    name: "Pancakes",
    category: "American",
    country: "USA",
    continent: "Americas",
    meal: "Breakfast",
    rating: "4.6",
    time: "20 min",
    servings: 4,
    image:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1000&q=85",
    description:
      "Fluffy American-style pancakes perfect for a comforting breakfast.",
    ingredients: [
      ["Flour", 200, "g"],
      ["Milk", 1.5, "cups"],
      ["Eggs", 2, "pieces"],
      ["Sugar", 2, "tbsp"],
      ["Baking powder", 2, "tsp"],
      ["Butter", 2, "tbsp"],
    ],
    instructions: [
      "Mix the dry ingredients.",
      "Whisk milk and eggs.",
      "Combine wet and dry ingredients.",
      "Heat a pan.",
      "Cook pancakes on both sides.",
      "Serve with fruit or syrup.",
    ],
    substitutions: [
      ["Milk", "Oat milk", "Almond milk"],
      ["Eggs", "Flax eggs", "Banana"],
      ["Butter", "Coconut oil", "Vegetable oil"],
    ],
  },

  {
    name: "Chocolate Cake",
    category: "French",
    country: "France",
    continent: "Europe",
    meal: "Dessert",
    rating: "4.9",
    time: "50 min",
    servings: 4,
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85",
    description:
      "Rich chocolate cake with deep cocoa flavour and a soft texture.",
    ingredients: [
      ["Flour", 200, "g"],
      ["Cocoa powder", 50, "g"],
      ["Sugar", 150, "g"],
      ["Eggs", 2, "pieces"],
      ["Milk", 1, "cup"],
      ["Butter", 100, "g"],
    ],
    instructions: [
      "Preheat oven to 180°C.",
      "Mix dry ingredients.",
      "Beat eggs, sugar and butter.",
      "Combine wet and dry ingredients.",
      "Pour into a cake tin.",
      "Bake for 35–40 minutes.",
    ],
    substitutions: [
      ["Eggs", "Flax eggs", "Applesauce"],
      ["Milk", "Oat milk", "Soy milk"],
      ["Butter", "Coconut oil", "Vegetable oil"],
    ],
  },
];

function HeartIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      className="w-5 h-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
      />
    </svg>
  );
}

function Recipes({ search = "", onSearch = () => {} }) {
  const dispatch = useDispatch();

  const recipes = useSelector((state) => state.recipe?.recipes || []);
  const liveRecipes = useSelector((state) => state.recipe?.liveRecipes || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [continent, setContinent] = useState("");
  const [country, setCountry] = useState("");
  const [meal, setMeal] = useState("");
  const [category, setCategory] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Redux state
  const favorites = useSelector(
    (state) => state.recipe?.favorites || []
  );

  const selectedRecipe = useSelector(
    (state) => state.recipe?.selectedRecipe
  );

  const servings = useSelector(
    (state) => state.recipe?.servings || 4
  );

  // Fetch recipes from backend
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            `API Error: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch recipes");
        }

        dispatch(setRecipeCatalog(data.data.map(prepareRecipe)));
      } catch (err) {
        console.error("Error fetching recipes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [dispatch]);

  const countries = [...new Set(recipes.map((recipe) => recipe.country).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right));
  const continents = new Set(recipes.map(getRecipeContinent));
  const continentOrder = ["Asia", "Europe", "Africa", "North America", "South America", "Oceania", "Caribbean", "Middle East"];
  const orderedContinents = continentOrder.filter((name) => continents.has(name));
  const recipesInRegion = recipes.filter((recipe) =>
    (!continent || getRecipeContinent(recipe) === continent)
    && (!country || recipe.country === country)
  );
  const availableMeals = [...new Set(recipesInRegion.map((recipe) => recipe.meal).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right));
  const facetRecipes = recipesInRegion.filter((recipe) => !meal || recipe.meal.toLowerCase() === meal.toLowerCase());
  const categoryCounts = new Map();
  facetRecipes.forEach((recipe) => {
    getRecipeCategories(recipe).forEach((tag) => categoryCounts.set(tag, (categoryCounts.get(tag) || 0) + 1));
  });
  const preferredCategories = [
    "Breakfast", "Healthy", "Vegetarian", "Vegan", "Chicken", "Meat", "Seafood", "Pasta",
    "Rice", "Noodles", "Pizza", "Soup", "Salad", "Desserts", "Baking", "Snacks", "Spicy",
    "Quick & Easy", "High Protein", "Street Food", "Beverages", "Main Course",
  ];
  const availableCategories = preferredCategories.filter((name) => categoryCounts.has(name));
  const explorerRecipes = filterRecipes(recipes, { continent, country, meal, category, search });
  const explorerActive = Boolean(continent || country || meal || category || search.trim() || showAll);
  const featuredRecipeNames = ["Feijoada", "Butter Chicken", "Hyderabadi Biryani", "Ramen", "Tacos", "Masala Dosa"];
  const curatedPopular = featuredRecipeNames.map((name) => recipes.find((recipe) => recipe.name === name)).filter(Boolean);
  const popularRecipes = [...curatedPopular, ...recipes.filter((recipe) => !curatedPopular.includes(recipe))].slice(0, 6);
  const visibleRecipes = (explorerActive ? explorerRecipes : popularRecipes).slice(0, visibleCount);
  const featuredCountries = ["India", "Italy", "Japan", "Mexico", "Thailand", "France", "Morocco", "Brazil"]
    .filter((name) => countries.includes(name));
  const countryFlags = {
    India: "🇮🇳", Italy: "🇮🇹", Japan: "🇯🇵", Mexico: "🇲🇽", Thailand: "🇹🇭", France: "🇫🇷",
    Morocco: "🇲🇦", Brazil: "🇧🇷", "South Korea": "🇰🇷", China: "🇨🇳", Egypt: "🇪🇬",
    Australia: "🇦🇺", "United States": "🇺🇸", Canada: "🇨🇦", Spain: "🇪🇸", Greece: "🇬🇷",
    Germany: "🇩🇪", Portugal: "🇵🇹", Argentina: "🇦🇷", "Puerto Rico": "🇵🇷",
  };
  const activeFilterCount = [continent, country, meal, category, search.trim()].filter(Boolean).length;

  const clearAllFilters = () => {
    setContinent("");
    setCountry("");
    setMeal("");
    setCategory("");
    onSearch("");
    setShowAll(false);
    setVisibleCount(12);
  };

  const selectCountry = (name) => {
    setCountry(name);
    if (name) {
      const selectedRecipe = recipes.find((recipe) => recipe.country === name);
      setContinent(selectedRecipe ? getRecipeContinent(selectedRecipe) : "");
    }
    setVisibleCount(12);
  };

  const selectContinent = (name) => {
    setContinent((current) => current === name ? "" : name);
    setCountry("");
    setVisibleCount(12);
  };

  const selectMeal = (name) => {
    setMeal((current) => current === name ? "" : name);
    setVisibleCount(12);
  };

  const selectCategory = (name) => {
    setCategory((current) => current === name ? "" : name);
    setVisibleCount(12);
  };

  const filterControls = (idSuffix) => (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <label htmlFor={`country-picker-${idSuffix}`} className="mb-2 block text-sm font-bold text-gray-800">Country</label>
        <input
          id={`country-picker-${idSuffix}`}
          list={`recipe-countries-${idSuffix}`}
          value={country}
          onChange={(event) => selectCountry(event.target.value)}
          placeholder="Search a country..."
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
        <datalist id={`recipe-countries-${idSuffix}`}>
          {countries.filter((name) => !continent || recipes.some((recipe) => recipe.country === name && getRecipeContinent(recipe) === continent)).map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </div>
      <div>
        <p className="mb-2 block text-sm font-bold text-gray-800">Meal</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => selectMeal("")} className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${!meal ? "border-orange-500 bg-orange-500 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-orange-300"}`}>All</button>
          {availableMeals.map((item) => (
            <button key={item} onClick={() => selectMeal(item)} className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${meal === item ? "border-orange-500 bg-orange-500 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-orange-300"}`}>
              {item} <span className="ml-1 opacity-70">{recipesInRegion.filter((recipe) => recipe.meal === item).length}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-gray-800">Categories</p>
          {category && <button onClick={() => selectCategory("")} className="text-xs font-semibold text-orange-700 hover:text-orange-900">Clear category</button>}
        </div>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((item) => (
            <button key={item} onClick={() => selectCategory(item)} className={`rounded-full border px-3 py-2 text-sm font-medium transition ${category === item ? "border-emerald-700 bg-emerald-800 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-emerald-500 hover:text-emerald-800"}`}>
              {item} <span className="ml-1 opacity-60">{categoryCounts.get(item)}</span>
            </button>
          ))}
          {availableCategories.length === 0 && <span className="text-sm text-gray-500">Choose a region or country to see available categories.</span>}
        </div>
      </div>
    </div>
  );

  const renderRecipeCard = (recipe) => {
    const favorite = isFavorite(recipe.name);
    return (
      <article key={recipe._id || recipe.name} className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img src={recipe.image} alt={recipe.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <span className="absolute left-3 top-3 rounded bg-white/95 px-2.5 py-1 text-xs font-bold text-gray-800">{recipe.category}</span>
          <button onClick={() => dispatch(toggleFavorite(recipe.name))} aria-label={favorite ? `Remove ${recipe.name} from favorites` : `Add ${recipe.name} to favorites`} className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition ${favorite ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:text-orange-600"}`}>
            <HeartIcon filled={favorite} />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold leading-snug text-gray-900">{recipe.name}</h3>
            <span className="shrink-0 text-sm font-semibold text-amber-600">★ {recipe.rating}</span>
          </div>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-gray-600">{recipe.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded bg-gray-100 px-2.5 py-1 text-gray-700">{countryFlags[recipe.country] || "🌍"} {recipe.country}</span>
            <span className="rounded bg-orange-50 px-2.5 py-1 text-orange-800">{recipe.meal}</span>
            <span className="rounded bg-gray-100 px-2.5 py-1 text-gray-600">{recipe.time}</span>
          </div>
          <button onClick={() => openRecipe(recipe)} className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600">View recipe <span aria-hidden="true">→</span></button>
        </div>
      </article>
    );
  };

  // Check if recipe is favorited
  const isFavorite = (recipeName) => {
    return favorites.includes(recipeName);
  };

  // Open recipe modal
  const openRecipe = (recipe) => {
    dispatch(selectRecipe(recipe));
    document.body.style.overflow = "hidden";
  };

  // Close recipe modal
  const closeRecipe = () => {
    dispatch(clearSelectedRecipe());
    document.body.style.overflow = "auto";
  };

  // Calculate adjusted quantity based on servings
  const getQuantity = (quantity) => {
    const value = (quantity * servings) / 4;

    if (Number.isInteger(value)) return value;

    return Number(value.toFixed(2));
  };

  // Loading state
  if (loading) {
    return (
      <section id="recipes" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <span className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Explore & Discover
            </span>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Popular Recipes
            </h2>

            <div className="mt-12 py-16">
              <div className="text-6xl mb-4">🍳</div>

              <h3 className="text-2xl font-bold text-gray-900">
                Loading recipes...
              </h3>

              <p className="text-gray-500 mt-2">
                Fetching recipes from MongoDB Atlas database
              </p>

              <div className="mt-8 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section id="recipes" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              Explore & Discover
            </span>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Popular Recipes
            </h2>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>

            <h3 className="text-2xl font-bold text-red-900">
              Unable to Load Recipes
            </h3>

            <p className="text-red-700 mt-3 text-lg">
              {error}
            </p>

            <div className="mt-6 bg-red-100 rounded-lg p-4 text-left text-sm text-red-800">
              <p className="font-semibold mb-2">Troubleshooting:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Ensure backend is running:{" "}
                  <code className="bg-white px-2 py-1 rounded">
                    npm run dev
                  </code>{" "}
                  in backend/
                </li>
                <li>
                  Check MongoDB connection in backend/.env
                </li>
                <li>
                  Run seed script:{" "}
                  <code className="bg-white px-2 py-1 rounded">
                    npm run seed
                  </code>{" "}
                  in backend/
                </li>
                <li>
                  Check browser console and server logs for details
                </li>
              </ul>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="recipes" className="bg-[#f7f8f5] py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header id="categories" className="mb-10 flex flex-col gap-5 border-b border-gray-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-[0.12em] text-emerald-800">RecipeVerse · Global food atlas</p>
            <h2 className="text-3xl font-extrabold text-gray-950 md:text-4xl">Where do you want to eat from today?</h2>
            <p className="mt-3 max-w-2xl text-gray-600">Start with a region, find a cuisine, then narrow it down to the dish you want to cook.</p>
          </div>
          <button onClick={() => setMobileFiltersOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-800 shadow-sm md:hidden">
            <span aria-hidden="true">☷</span> Filters {activeFilterCount > 0 && <span className="rounded bg-orange-100 px-1.5 py-0.5 text-orange-800">{activeFilterCount}</span>}
          </button>
        </header>

        <section aria-labelledby="popular-heading" className="mb-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-700">A good place to begin</p>
              <h3 id="popular-heading" className="mt-1 text-2xl font-bold text-gray-950">Popular recipes</h3>
            </div>
            <button onClick={() => { setShowAll(true); setVisibleCount(12); requestAnimationFrame(() => document.querySelector("#recipe-results")?.scrollIntoView({ behavior: "smooth", block: "start" })); }} className="shrink-0 text-sm font-bold text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:text-orange-700">
              View all {recipes.length} recipes
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {popularRecipes.map(renderRecipeCard)}
          </div>
        </section>

        {!explorerActive && liveRecipes.length > 0 && (
          <section aria-labelledby="live-recipes-heading" className="mb-14 border-b border-gray-200 pb-12">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Updated just now</p>
              <h3 id="live-recipes-heading" className="mt-1 text-2xl font-bold text-gray-950">Live recipe updates</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {liveRecipes.map(renderRecipeCard)}
            </div>
          </section>
        )}

        <section aria-labelledby="continent-heading" className="mb-12">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Choose your starting point</p>
              <h3 id="continent-heading" className="mt-1 text-2xl font-bold text-gray-950">Explore by continent</h3>
            </div>
            {continent && <button onClick={() => selectContinent(continent)} className="text-sm font-semibold text-gray-600 hover:text-orange-700">Clear region</button>}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {orderedContinents.map((name) => {
              const continentRecipes = recipes.filter((recipe) => getRecipeContinent(recipe) === name);
              const countryCount = new Set(continentRecipes.map((recipe) => recipe.country)).size;
              const icons = { Asia: "🌏", Europe: "🌍", Africa: "🌍", "North America": "🌎", "South America": "🌎", Oceania: "🌏", Caribbean: "🌴", "Middle East": "🌙" };
              return (
                <button key={name} onClick={() => selectContinent(name)} aria-pressed={continent === name} className={`min-h-28 rounded-lg border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-md ${continent === name ? "border-emerald-800 bg-emerald-900 text-white" : "border-gray-200 bg-white text-gray-900 hover:border-emerald-500"}`}>
                  <span className="text-xl" aria-hidden="true">{icons[name] || "🌍"}</span>
                  <span className="mt-2 block text-sm font-bold leading-tight">{name}</span>
                  <span className={`mt-1 block text-xs ${continent === name ? "text-emerald-100" : "text-gray-500"}`}>{countryCount} {countryCount === 1 ? "country" : "countries"} · {continentRecipes.length} recipes</span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="destinations-heading" className="mb-12">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-700">Featured destinations</p>
            <h3 id="destinations-heading" className="mt-1 text-2xl font-bold text-gray-950">Explore by country</h3>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {featuredCountries.map((name) => {
              const count = recipes.filter((recipe) => recipe.country === name).length;
              return (
                <button key={name} onClick={() => selectCountry(name)} className={`flex min-h-16 items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition hover:border-orange-300 hover:bg-orange-50 ${country === name ? "border-orange-500 bg-orange-50" : "border-gray-200 bg-white"}`}>
                  <span className="flex min-w-0 items-center gap-3"><span className="text-2xl" aria-hidden="true">{countryFlags[name] || "🌍"}</span><span className="truncate font-bold text-gray-900">{name}</span></span>
                  <span className="shrink-0 text-xs text-gray-500">{count}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-label="Recipe filters" className="mb-8 hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:block">
          {filterControls("desktop")}
        </section>

        {mobileFiltersOpen && (
          <dialog open aria-label="Recipe filters" className="fixed inset-0 z-[60] m-0 h-dvh w-screen max-w-none border-0 bg-black/45 p-0 md:hidden">
            <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-[#f7f8f5] p-5 shadow-2xl">
              <div className="mb-5 flex items-center justify-between"><h3 className="text-xl font-bold text-gray-950">Refine your search</h3><button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="h-10 w-10 rounded-full bg-white text-xl text-gray-700">×</button></div>
              {filterControls("mobile")}
              <button onClick={() => setMobileFiltersOpen(false)} className="mt-6 w-full rounded-lg bg-emerald-900 px-4 py-3 font-bold text-white">Show {explorerRecipes.length} recipes</button>
            </div>
          </dialog>
        )}

        {(activeFilterCount > 0 || showAll) && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm font-bold text-gray-700">Active filters</span>
            {continent && <button onClick={() => selectContinent(continent)} className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-900">{continent} ×</button>}
            {country && <button onClick={() => selectCountry("")} className="rounded-full bg-orange-100 px-3 py-1.5 text-sm font-semibold text-orange-900">{countryFlags[country] || "🌍"} {country} ×</button>}
            {meal && <button onClick={() => selectMeal(meal)} className="rounded-full bg-blue-100 px-3 py-1.5 text-sm font-semibold text-blue-900">{meal} ×</button>}
            {category && <button onClick={() => selectCategory(category)} className="rounded-full bg-rose-100 px-3 py-1.5 text-sm font-semibold text-rose-900">{category} ×</button>}
            {search.trim() && <button onClick={() => onSearch("")} className="rounded-full bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-800">Search: {search} ×</button>}
            <button onClick={clearAllFilters} className="ml-auto text-sm font-bold text-gray-600 underline underline-offset-4 hover:text-orange-700">Clear all</button>
          </div>
        )}

        {explorerActive && (
          <section id="recipe-results" aria-live="polite" className="scroll-mt-24">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">Your recipe shelf</p>
                <h3 className="mt-1 text-2xl font-bold text-gray-950">{country || continent || category || "All recipes"}</h3>
              </div>
              <p className="text-sm font-semibold text-gray-600">{explorerRecipes.length} {explorerRecipes.length === 1 ? "recipe" : "recipes"} found</p>
            </div>
            {explorerRecipes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
                <p className="text-lg font-bold text-gray-900">No recipes match these filters</p>
                <p className="mt-2 text-sm text-gray-600">Try removing a filter or broadening your search.</p>
                <button onClick={clearAllFilters} className="mt-5 rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-bold text-white">Clear all filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {visibleRecipes.map(renderRecipeCard)}
                </div>
                {visibleCount < explorerRecipes.length && <div className="mt-8 text-center"><p className="mb-3 text-sm text-gray-500">Showing {Math.min(visibleCount, explorerRecipes.length)} of {explorerRecipes.length} recipes</p><button onClick={() => setVisibleCount((count) => count + 12)} className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-bold text-gray-800 transition hover:border-emerald-700 hover:text-emerald-900">Load 12 more</button></div>}
              </>
            )}
          </section>
        )}
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto p-4 md:p-8">

          <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl">

            {/* Modal Image */}
            <div className="relative h-64 md:h-80">

              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.name}
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

              {/* Close */}
              <button
                onClick={closeRecipe}
                aria-label="Close recipe"
                className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/90 text-gray-800 text-xl hover:bg-white transition"
              >
                ✕
              </button>

              <div className="absolute bottom-6 left-6 text-white">

                <span className="bg-orange-500 px-3 py-1 rounded-full text-sm font-semibold">
                  {selectedRecipe.category}
                </span>

                <h2 className="text-3xl md:text-4xl font-bold mt-3">
                  {selectedRecipe.name}
                </h2>

                <p className="text-sm mt-2 opacity-90">
                  {selectedRecipe.country} •{" "}
                  {selectedRecipe.continent} •{" "}
                  {selectedRecipe.meal}
                </p>

              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-10">

              <p className="text-gray-600 text-lg leading-7">
                {selectedRecipe.description}
              </p>

              {/* Recipe Stats */}
              <div className="grid grid-cols-3 gap-3 mt-7">

                <div className="bg-orange-50 rounded-2xl p-4 text-center">
                  <p className="text-yellow-500 text-xl">★</p>

                  <p className="font-bold text-gray-900">
                    {selectedRecipe.rating}
                  </p>

                  <p className="text-xs text-gray-500">
                    Rating
                  </p>
                </div>

                <div className="bg-orange-50 rounded-2xl p-4 text-center">
                  <p className="text-xl">⏱</p>

                  <p className="font-bold text-gray-900">
                    {selectedRecipe.time}
                  </p>

                  <p className="text-xs text-gray-500">
                    Total Time
                  </p>
                </div>

                <div className="bg-orange-50 rounded-2xl p-4 text-center">
                  <p className="text-xl">👥</p>

                  <p className="font-bold text-gray-900">
                    {servings}
                  </p>

                  <p className="text-xs text-gray-500">
                    Servings
                  </p>
                </div>

              </div>

              {/* Ingredients */}
              <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div>

                  <h3 className="text-2xl font-bold">
                    Ingredients
                  </h3>

                  <p className="text-gray-500 text-sm mt-1">
                    Quantities automatically adjust with servings.
                  </p>

                </div>

                {/* Serving Controls */}
                <div className="flex items-center gap-4 bg-gray-100 rounded-xl p-2">

                  <button
                    onClick={() => dispatch(decreaseServings())}
                    className="w-10 h-10 rounded-lg bg-white shadow-sm text-xl font-bold hover:bg-orange-500 hover:text-white transition"
                  >
                    −
                  </button>

                  <span className="font-bold min-w-20 text-center">
                    {servings} servings
                  </span>

                  <button
                    onClick={() => dispatch(increaseServings())}
                    className="w-10 h-10 rounded-lg bg-white shadow-sm text-xl font-bold hover:bg-orange-500 hover:text-white transition"
                  >
                    +
                  </button>

                </div>
              </div>

              {/* Ingredients List */}
              <div className="mt-5 grid sm:grid-cols-2 gap-3">

                {selectedRecipe.ingredients.map(
                  ([name, quantity, unit], idx) => (
                    <div
                      key={`${name}-${idx}`}
                      className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3"
                    >
                      <span className="text-gray-700">
                        {name}
                      </span>

                      <span className="font-semibold text-gray-900">
                        {typeof quantity === "number"
                          ? getQuantity(quantity)
                          : quantity}{" "}
                        {unit}
                      </span>
                    </div>
                  )
                )}

              </div>

              {/* Cooking Instructions */}
              <div className="mt-10">

                <h3 className="text-2xl font-bold mb-5">
                  Cooking Instructions
                </h3>

                <div className="space-y-4">

                  {selectedRecipe.instructions.map(
                    (instruction, index) => (
                      <div
                        key={index}
                        className="flex gap-4"
                      >

                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>

                        <p className="text-gray-600 leading-7 pt-1">
                          {instruction}
                        </p>

                      </div>
                    )
                  )}

                </div>
              </div>

              {/* Substitutions */}
              <div className="mt-10">

                <h3 className="text-2xl font-bold mb-2">
                  Ingredient Substitutions
                </h3>

                <p className="text-gray-500 mb-5">
                  Don't have an ingredient? Try one of these alternatives.
                </p>

                <div className="grid sm:grid-cols-3 gap-4">

                  {selectedRecipe.substitutions.map(
                    ([original, option1, option2], idx) => (
                      <div
                        key={`${original}-${idx}`}
                        className="border border-orange-100 bg-orange-50 rounded-2xl p-5"
                      >

                        <p className="font-bold text-gray-900">
                          {original}
                        </p>

                        <p className="text-sm text-gray-500 mt-2">
                          Replace with:
                        </p>

                        <div className="flex flex-wrap gap-2 mt-3">

                          <span className="bg-white px-3 py-1.5 rounded-full text-sm font-medium">
                            {option1}
                          </span>

                          <span className="bg-white px-3 py-1.5 rounded-full text-sm font-medium">
                            {option2}
                          </span>

                        </div>

                      </div>
                    )
                  )}

                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row gap-3">

                <button
                  onClick={() =>
                    dispatch(toggleFavorite(selectedRecipe.name))
                  }
                  className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                    isFavorite(selectedRecipe.name)
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >

                  <HeartIcon
                    filled={isFavorite(selectedRecipe.name)}
                  />

                  {isFavorite(selectedRecipe.name)
                    ? "Saved to Favorites"
                    : "Add to Favorites"}

                </button>

                <button
                  onClick={closeRecipe}
                  className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50 transition"
                >
                  ← Back to Recipes
                </button>

              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Recipes;