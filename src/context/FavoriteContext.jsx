import { createContext } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

export const FavoriteContext = createContext();

export function FavoriteProvider({ children }) {
  const [favorites, setFavorites] = useLocalStorage(
    "favoriteRecipes",
    []
  );

  const toggleFavorite = (recipe) => {
    setFavorites((currentFavorites) => {
      if (currentFavorites.includes(recipe)) {
        return currentFavorites.filter(
          (item) => item !== recipe
        );
      }

      return [...currentFavorites, recipe];
    });
  };

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        toggleFavorite,
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
}