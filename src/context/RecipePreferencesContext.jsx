import { createContext, useContext, useState } from "react";

const RecipePreferencesContext = createContext();

export function RecipePreferencesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (recipeName) => {
    setFavorites((current) =>
      current.includes(recipeName)
        ? current.filter((name) => name !== recipeName)
        : [...current, recipeName]
    );
  };

  const isFavorite = (recipeName) => {
    return favorites.includes(recipeName);
  };

  return (
    <RecipePreferencesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </RecipePreferencesContext.Provider>
  );
}

export function useRecipePreferences() {
  return useContext(RecipePreferencesContext);
}