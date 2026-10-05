function parseIngredient(item) {
  if (Array.isArray(item)) return item;

  const value = String(item || "");
  const parts = value.split(" - ");
  if (parts.length !== 2) return [value, "", ""];

  const name = parts[0].trim();
  const rest = parts[1].trim();
  const match = rest.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (!match) return [name, rest, ""];

  return [name, Number.parseFloat(match[1]), match[2] || ""];
}

function parseSubstitution(item) {
  if (Array.isArray(item)) return item;

  const parts = String(item || "").split(" → ");
  if (parts.length !== 2) return [String(item || ""), "", ""];

  const alternatives = parts[1].split(",").map((value) => value.trim());
  return [parts[0].trim(), alternatives[0] || "", alternatives[1] || ""];
}

export function prepareRecipe(recipe) {
  return {
    ...recipe,
    ingredients: (recipe.ingredients || []).map(parseIngredient),
    substitutions: (recipe.substitutions || []).map(parseSubstitution),
    rating: recipe.rating || "4.8",
    time: recipe.time || "45 min",
  };
}