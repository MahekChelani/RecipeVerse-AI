const countryRegions = { "Puerto Rico": "Caribbean" };

const categoryDefinitions = [
  ["Breakfast", /\b(breakfast|brunch|pancake|waffle|omelet|omelette|dosa|porridge)\b/],
  ["Healthy", /\b(healthy|salad|grilled|steamed|vegetable|lentil|quinoa)\b/],
  ["Vegetarian", /\b(vegetarian|vegetable|veggie|paneer|tofu|lentil|bean|chickpea|potato|mushroom)\b/],
  ["Vegan", /\b(vegan|plant-based)\b/],
  ["Chicken", /\b(chicken|poultry)\b/],
  ["Meat", /\b(beef|pork|lamb|mutton|sausage|bacon|duck|steak|meat)\b/],
  ["Seafood", /\b(fish|seafood|salmon|tuna|cod|shrimp|prawn|crab|mussel|clam|anchov|sardine)\b/],
  ["Pasta", /\b(pasta|spaghetti|lasagna|lasagne|carbonara|macaroni|ravioli|penne)\b/],
  ["Rice", /\b(rice|risotto|biryani|paella|pilaf|fried rice|arroz)\b/],
  ["Noodles", /\b(noodle|ramen|udon|soba|pad thai|pho)\b/],
  ["Pizza", /\b(pizza|flatbread)\b/],
  ["Soup", /\b(soup|broth|stew|chowder|ramen|pho)\b/],
  ["Salad", /\b(salad|slaw)\b/],
  ["Desserts", /\b(dessert|cake|cookie|brownie|tart|pie|pudding|ice cream|pastry|chocolate|sweet|strudel|nata)\b/],
  ["Baking", /\b(bake|baked|bread|cake|cookie|pastry|tart|pie|muffin)\b/],
  ["Snacks", /\b(snack|street food|samosa|pakora|spring roll|fritter|taco)\b/],
  ["Spicy", /\b(spicy|chili|chilli|pepper|curry|masala|harissa|sambal)\b/],
  ["High Protein", /\b(chicken|beef|pork|lamb|fish|egg|tofu|paneer|lentil|bean|chickpea|shrimp|prawn)\b/],
  ["Street Food", /\b(street food|taco|tacos|samosa|sate|satay|kebab|kebap|bhature|pav bhaji)\b/],
  ["Beverages", /\b(beverage|drink|tea|coffee|juice|smoothie|lassi|lemonade)\b/],
];

const normalize = (value) => String(value || "").trim().toLowerCase();

export function getRecipeContinent(recipe) {
  return countryRegions[recipe.country] || recipe.continent || "Other";
}

export function getRecipeCategories(recipe) {
  if (Array.isArray(recipe.categories) && recipe.categories.length) {
    return recipe.categories;
  }

  const ingredients = Array.isArray(recipe.ingredients)
    ? recipe.ingredients.flat().join(" ")
    : "";
  const text = normalize(
    [recipe.name, recipe.category, recipe.meal, recipe.description, ingredients].join(" ")
  );
  const categories = new Set();

  categoryDefinitions.forEach(([category, pattern]) => {
    if (pattern.test(text)) categories.add(category);
  });

  if (/\b(meat|chicken|beef|pork|lamb|fish|shrimp|prawn)\b/.test(text)) {
    categories.delete("Desserts");
    categories.delete("Baking");
  }

  if (/\b(vegetarian|vegetable|veggie|paneer|tofu|lentil|bean|chickpea|potato|mushroom)\b/.test(text)
    && !/\b(chicken|beef|pork|lamb|mutton|fish|shrimp|prawn|seafood|bacon|sausage)\b/.test(text)) {
    categories.add("Vegetarian");
  }

  if (recipe.meal) categories.add(recipe.meal);
  if (/\b(main course|dinner|lunch)\b/.test(normalize(recipe.meal))) categories.add("Main Course");
  if (/\b(indian|italian|japanese|thai|mexican|french|brazilian|chinese|korean)\b/.test(text)) {
    categories.add(recipe.category);
  }
  if ((recipe.ingredients?.length || 0) <= 9 && (recipe.instructions?.length || 0) <= 6) {
    categories.add("Quick & Easy");
  }

  return [...categories].filter(Boolean);
}

export function filterRecipes(recipes, filters) {
  const { continent, country, meal, category, search } = filters;
  const query = normalize(search);

  return recipes.filter((recipe) => {
    if (continent && getRecipeContinent(recipe) !== continent) return false;
    if (country && recipe.country !== country) return false;
    if (meal && normalize(recipe.meal) !== normalize(meal)) return false;
    if (category && !getRecipeCategories(recipe).some((item) => normalize(item) === normalize(category))) return false;
    if (query) {
      const haystack = [
        recipe.name,
        recipe.category,
        recipe.country,
        getRecipeContinent(recipe),
        recipe.meal,
        recipe.description,
        ...getRecipeCategories(recipe),
      ].join(" ");
      if (!normalize(haystack).includes(query)) return false;
    }
    return true;
  });
}