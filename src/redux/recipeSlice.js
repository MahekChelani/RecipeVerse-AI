import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  favorites: [],
  search: "",
  selectedRecipe: null,
  servings: 4,
  recipes: [],
  liveRecipes: [],
  deletedRecipeIds: [],
  connectionStatus: "connecting",
  notifications: [],
  activities: [],
  realtimeToast: null,
};

const getRecipeId = (recipe) => String(recipe?._id || recipe?.id || "");

const upsertRecipe = (state, recipe) => {
  const id = getRecipeId(recipe);
  state.deletedRecipeIds = state.deletedRecipeIds.filter((deletedId) => deletedId !== id);
  const index = state.recipes.findIndex((item) => getRecipeId(item) === id);
  if (index >= 0) {
    state.recipes[index] = recipe;
  } else {
    state.recipes.unshift(recipe);
  }
};

const upsertLiveRecipe = (state, recipe) => {
  const id = getRecipeId(recipe);
  state.liveRecipes = [recipe, ...state.liveRecipes.filter((item) => getRecipeId(item) !== id)].slice(0, 4);
};

const reconcileRecipeCatalog = (state, incomingRecipes) => {
  const deletedIds = new Set(state.deletedRecipeIds);
  const liveById = new Map(state.liveRecipes.map((recipe) => [getRecipeId(recipe), recipe]));
  const merged = incomingRecipes
    .filter((recipe) => !deletedIds.has(getRecipeId(recipe)))
    .map((recipe) => liveById.get(getRecipeId(recipe)) || recipe);
  const presentIds = new Set(merged.map(getRecipeId));

  state.recipes = [
    ...state.liveRecipes.filter((recipe) => !deletedIds.has(getRecipeId(recipe)) && !presentIds.has(getRecipeId(recipe))),
    ...merged,
  ];
};

const recipeSlice = createSlice({
  name: "recipes",

  initialState,

  reducers: {
    toggleFavorite: (state, action) => {
      const recipeName = action.payload;

      if (state.favorites.includes(recipeName)) {
        state.favorites = state.favorites.filter(
          (name) => name !== recipeName
        );
      } else {
        state.favorites.push(recipeName);
      }
    },

    setSearch: (state, action) => {
      state.search = action.payload;
    },

    setRecipeCatalog: (state, action) => {
      reconcileRecipeCatalog(state, action.payload);
    },

    addRecipeFromSocket: (state, action) => {
      upsertRecipe(state, action.payload);
      upsertLiveRecipe(state, action.payload);
    },

    updateRecipeFromSocket: (state, action) => {
      upsertRecipe(state, action.payload);
      upsertLiveRecipe(state, action.payload);
      if (getRecipeId(state.selectedRecipe) === getRecipeId(action.payload)) {
        state.selectedRecipe = action.payload;
      }
    },

    removeRecipeFromSocket: (state, action) => {
      const id = String(action.payload);
      if (!state.deletedRecipeIds.includes(id)) state.deletedRecipeIds.push(id);
      state.recipes = state.recipes.filter((recipe) => getRecipeId(recipe) !== id);
      state.liveRecipes = state.liveRecipes.filter((recipe) => getRecipeId(recipe) !== id);
      if (getRecipeId(state.selectedRecipe) === id) state.selectedRecipe = null;
    },

    setConnectionStatus: (state, action) => {
      state.connectionStatus = action.payload;
    },

    addRealtimeNotification: (state, action) => {
      if (state.notifications.some((item) => item.id === action.payload.id)) return;
      state.notifications.unshift({ ...action.payload, read: false });
      state.notifications = state.notifications.slice(0, 20);
    },

    markNotificationRead: (state, action) => {
      const notification = state.notifications.find((item) => item.id === action.payload);
      if (notification) notification.read = true;
    },

    markAllNotificationsRead: (state) => {
      state.notifications.forEach((notification) => { notification.read = true; });
    },

    clearRealtimeNotifications: (state) => {
      state.notifications = [];
    },

    addRealtimeActivity: (state, action) => {
      if (state.activities.some((item) => item.id === action.payload.id)) return;
      state.activities.unshift(action.payload);
      state.activities = state.activities.slice(0, 10);
    },

    setRealtimeToast: (state, action) => {
      state.realtimeToast = action.payload;
    },

    clearRealtimeToast: (state) => {
      state.realtimeToast = null;
    },

    selectRecipe: (state, action) => {
      state.selectedRecipe = action.payload;
      state.servings = action.payload.servings;
    },

    clearSelectedRecipe: (state) => {
      state.selectedRecipe = null;
    },

    increaseServings: (state) => {
      if (state.servings < 20) {
        state.servings += 1;
      }
    },

    decreaseServings: (state) => {
      if (state.servings > 1) {
        state.servings -= 1;
      }
    },
  },
});

export const {
  toggleFavorite,
  setSearch,
  setRecipeCatalog,
  addRecipeFromSocket,
  updateRecipeFromSocket,
  removeRecipeFromSocket,
  setConnectionStatus,
  addRealtimeNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearRealtimeNotifications,
  addRealtimeActivity,
  setRealtimeToast,
  clearRealtimeToast,
  selectRecipe,
  clearSelectedRecipe,
  increaseServings,
  decreaseServings,
} = recipeSlice.actions;

export default recipeSlice.reducer;