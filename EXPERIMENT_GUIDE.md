# RecipeVerse AI - Complete Project Setup & Testing Guide

## 📋 Project Overview

RecipeVerse AI is a full-stack recipe application that satisfies all college experiments:

- **Experiment 1**: Responsive UI with Tailwind CSS ✅
- **Experiment 2**: React Hooks (useEffect, useContext, custom hooks) ✅
- **Experiment 3**: State Management with Redux ✅
- **Experiment 4**: REST API with MongoDB + Mongoose ✅

---

## 🚀 QUICK START

### 1. Install Frontend Dependencies

```bash
cd recipe-app-exp2
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure MongoDB Connection

Edit `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://recipeadmin:Recipe@12345@cluster0.gdu4zpv.mongodb.net/recipeverse?retryWrites=true&w=majority&appName=Cluster0
```

Replace `Recipe@12345` with your actual MongoDB Atlas password.

### 4. Populate Database

```bash
cd backend
npm run seed
```

Expected output:
```
🔗 Connecting to MongoDB...
✅ MongoDB connected successfully

🗑️  Clearing existing recipes...
✅ Existing recipes cleared

📝 Inserting seed recipes...
✅ 14 recipes inserted successfully

📊 Seed Database Summary:
- Total recipes: 14
- Collection: recipeverse.recipes
- Database connection: cluster0.gdu4zpv.mongodb.net

✨ Database seeding completed!
```

### 5. Start Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
MONGO_URI loaded: YES
MongoDB connected successfully
RecipeVerse backend running on port 5000
http://localhost:5000
```

### 6. Start Frontend (New Terminal)

```bash
npm run dev
```

Access at: `http://localhost:5173`

---

## 🧪 TESTING GUIDE

### A. Test Backend APIs (Use Postman or curl)

#### 1. Test Backend Status

```bash
curl http://localhost:5000/
```

Expected Response:
```json
{
  "message": "RecipeVerse AI REST API is running successfully!",
  "status": "success"
}
```

#### 2. GET All Recipes

```bash
curl http://localhost:5000/api/recipes
```

Expected Response:
```json
{
  "success": true,
  "count": 14,
  "data": [
    {
      "_id": "...",
      "name": "Butter Chicken",
      "category": "Indian",
      "country": "India",
      "continent": "Asia",
      "meal": "Dinner",
      "description": "...",
      "image": "...",
      "servings": 4,
      "ingredients": ["Chicken - 500g", ...],
      "instructions": [...],
      "substitutions": [...],
      "createdAt": "...",
      "updatedAt": "...",
      "__v": 0
    },
    ...more recipes
  ]
}
```

#### 3. GET Single Recipe by ID

```bash
curl http://localhost:5000/api/recipes/{RECIPE_ID}
```

Replace `{RECIPE_ID}` with an actual MongoDB _id from the GET all response.

Expected Response:
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Butter Chicken",
    ...all recipe fields...
  }
}
```

#### 4. CREATE New Recipe (POST)

```bash
curl -X POST http://localhost:5000/api/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Samosa",
    "category": "Indian",
    "country": "India",
    "continent": "Asia",
    "meal": "Snack",
    "description": "Crispy fried pastry with spiced potato filling",
    "image": "https://images.unsplash.com/photo-1599599810694-b3d2c1e37dcd",
    "servings": 4,
    "ingredients": ["Flour - 200g", "Potatoes - 300g", "Spices - 2 tsp"],
    "instructions": ["Prepare dough", "Fill with potato mixture", "Fry until golden"],
    "substitutions": ["Potatoes → Sweet potato", "Flour → Chickpea flour"]
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Recipe created successfully",
  "data": {
    "_id": "new_id_here",
    "name": "Samosa",
    ...all fields...
  }
}
```

#### 5. UPDATE Recipe (PUT)

```bash
curl -X PUT http://localhost:5000/api/recipes/{RECIPE_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Updated description",
    "servings": 6
  }'
```

Expected Response:
```json
{
  "success": true,
  "message": "Recipe updated successfully",
  "data": {
    "_id": "{RECIPE_ID}",
    "servings": 6,
    "description": "Updated description",
    ...other fields unchanged...
  }
}
```

#### 6. DELETE Recipe (DELETE)

```bash
curl -X DELETE http://localhost:5000/api/recipes/{RECIPE_ID}
```

Expected Response:
```json
{
  "success": true,
  "message": "Recipe deleted successfully",
  "data": {
    "_id": "{RECIPE_ID}",
    ...deleted recipe data...
  }
}
```

---

### B. Test Frontend Application

#### 1. Verify Page Load

- Open `http://localhost:5173` in browser
- You should see RecipeVerse AI homepage with:
  - ✅ Sticky Navbar with logo
  - ✅ Hero section with search bar
  - ✅ Loading spinner while fetching recipes
  - ✅ Recipe grid displaying 14 recipes

#### 2. Test Search Functionality

- Type "Indian" in search → Filter shows only Indian recipes
- Type "Breakfast" → Shows only breakfast recipes
- Type "Italy" → Shows Italian recipes
- Clear search → Shows all recipes

#### 3. Test Recipe Cards

- Each recipe card displays:
  - ✅ Recipe image
  - ✅ Category badge
  - ✅ Recipe name and description
  - ✅ Rating, time, and servings
  - ✅ Country and meal type tags
  - ✅ Heart icon for favorites
  - ✅ "View Recipe" button

#### 4. Test Favorites (Redux - Experiment 3)

- Click heart icon on any recipe card
- Heart turns orange → Recipe added to favorites
- Favorites persist during session
- Click again to remove from favorites
- Open recipe modal and test favorites button there too

#### 5. Test Recipe Modal (View Recipe)

- Click "View Recipe" button on any card
- Modal should display:
  - ✅ Large recipe image
  - ✅ Recipe name and location info
  - ✅ Recipe description
  - ✅ Rating, time, and servings stats
  - ✅ Ingredients list with quantities
  - ✅ Cooking instructions (numbered steps)
  - ✅ Ingredient substitutions
  - ✅ "Add to Favorites" and "Close" buttons

#### 6. Test Serving Quantity Controls (Redux - Experiment 3)

- Open any recipe modal
- Click "+" button next to servings
- Ingredient quantities should automatically adjust (scaled up)
- Click "-" button to decrease
- Quantities should scale down proportionally
- Example: If base is 4 servings and you increase to 8:
  - "Chicken 500g" → "Chicken 1000g"
  - "Oil 2 tbsp" → "Oil 4 tbsp"

#### 7. Test Error State

- Stop the backend server
- Refresh the page
- Should show error message with troubleshooting tips
- Verify error recovery button works

#### 8. Test Responsive Design (Experiment 1)

- Desktop view: Grid shows 3 columns
- Tablet view (768px): Grid shows 2 columns
- Mobile view (below 640px): Grid shows 1 column
- Navbar hamburger menu appears on mobile
- All text is readable on mobile
- Images scale properly

---

## 📊 VERIFY ALL EXPERIMENTS

### ✅ Experiment 1: Responsive UI + Tailwind CSS

**Location**: `src/components/` and `src/App.jsx`

Verify these components:
1. **Navbar.jsx** - Sticky navigation with mobile menu
2. **Hero.jsx** - Hero section with search bar
3. **Categories.jsx** - Category filters
4. **Recipes.jsx** - Recipe grid with cards
5. **Features.jsx** - Features section
6. **FAQ.jsx** - FAQ section

Check CSS:
- All components use Tailwind classes (px-, py-, grid, flex, etc.)
- `src/index.css` has Tailwind imports
- `tailwind.config.js` is configured
- No hardcoded pixels or inline styles

Test Responsiveness:
- Desktop (1200px+): Full layout
- Tablet (768px-1199px): 2-column grid
- Mobile (320px-767px): 1-column layout

---

### ✅ Experiment 2: React Hooks

**Location**: `src/hooks/` and `src/context/`

Verify implementations:

#### Custom Hooks:
1. **useDebounce.js** - Debounces search input
   - Uses `useState` and `useEffect`
   - Delays value updates by 400ms
   
2. **useLocalStorage.js** - Persists data to localStorage
   - Uses `useState` and `useEffect`
   - Saves and retrieves JSON data

#### useContext Usage:
1. **RecipePreferencesContext.jsx** - Context provider for preferences
   - Creates context
   - Provides `useRecipePreferences` hook
   - Manages favorites state
   - Used in components

#### useEffect Usage:
1. **Recipes.jsx** (NEW) - Fetches recipes from API
   - Runs on component mount
   - Sets loading state
   - Handles errors gracefully
   - Transforms API data

#### useState Usage:
- PreferencesPanel.jsx - Manages user preferences
- Recipes.jsx - Manages recipes, loading, error states
- Hero.jsx - Manages search input

**Test Experiment 2**:
```javascript
// Open browser console and verify:
// 1. Network tab shows fetch request to http://localhost:5000/api/recipes
// 2. Console shows no errors
// 3. Custom hooks work (check localStorage for saved data)
// 4. Search debounces (type fast, see delayed filtering)
```

---

### ✅ Experiment 3: Redux State Management

**Location**: `src/redux/` and component usage

#### Redux Store Structure:
```javascript
// src/redux/store.js
store.reducer = {
  recipe: {
    favorites: [],
    search: "",
    selectedRecipe: null,
    servings: 4
  }
}
```

#### Redux Actions (recipeSlice.js):
1. **toggleFavorite** - Add/remove recipe from favorites
2. **setSearch** - Update search query
3. **selectRecipe** - Open recipe modal
4. **clearSelectedRecipe** - Close recipe modal
5. **increaseServings** - Increase serving size (max 20)
6. **decreaseServings** - Decrease serving size (min 1)

#### Redux Usage in Components:
1. **Recipes.jsx**:
   - `useDispatch()` - Dispatch actions
   - `useSelector()` - Access state
   - Favorites, servings, selected recipe managed by Redux

2. **RecipeCard Buttons**:
   - Heart icon uses `toggleFavorite`
   - View button uses `selectRecipe`

3. **Recipe Modal**:
   - "+/-" buttons use `increaseServings`/`decreaseServings`
   - Quantities calculated from Redux servings state

**Test Experiment 3**:
```bash
# Open browser Redux DevTools (if installed)
# Dispatch an action and verify state changes:
# 1. Click heart icon → toggleFavorite action dispatched
# 2. Open modal and change servings → increaseServings action dispatched
# 3. Check Redux tab to verify state updates
```

---

### ✅ Experiment 4: REST API + MongoDB

**Location**: `backend/` directory

#### Backend Architecture:

```
backend/
├── models/Recipe.js          # Mongoose schema
├── routes/recipeRoutes.js    # REST API endpoints
├── server.js                 # Express server
├── seed.js                   # Database seed script
├── package.json              # Dependencies
└── .env                       # Configuration
```

#### Mongoose Recipe Model (models/Recipe.js):
```javascript
{
  name: String (required),
  category: String (required),
  country: String (required),
  continent: String (required),
  meal: String (required),
  description: String,
  image: String,
  servings: Number (default: 4, min: 1),
  ingredients: [String],
  instructions: [String],
  substitutions: [String],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### REST API Endpoints (routes/recipeRoutes.js):

| Method | Endpoint | Action |
|--------|----------|--------|
| GET | `/api/recipes` | Fetch all recipes |
| GET | `/api/recipes/:id` | Fetch single recipe |
| POST | `/api/recipes` | Create new recipe |
| PUT | `/api/recipes/:id` | Update recipe |
| DELETE | `/api/recipes/:id` | Delete recipe |

#### MongoDB Connection:
- Database: `recipeverse`
- Collection: `recipes`
- Connection: MongoDB Atlas
- Credentials: `.env` file (not in git)

**Test Experiment 4**:
1. Backend API Tests (see "TESTING GUIDE" section above)
2. Database Tests:
   ```bash
   # Login to MongoDB Atlas
   # Navigate to: recipeverse database → recipes collection
   # Should see 14 recipe documents
   # Each document has _id (MongoDB ObjectId)
   ```
3. Frontend Integration Test:
   ```bash
   # Open RecipeVerse at http://localhost:5173
   # Should see recipes loaded from MongoDB
   # Search, favorites, and serving controls all work
   # Data persists when you refresh page
   ```

---

## 🔍 DEBUGGING

### Backend Won't Start

```bash
# 1. Check if port 5000 is already in use
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# 2. Kill the process
kill -9 <PID>

# 3. Check MongoDB connection
# Verify .env has correct MONGO_URI

# 4. Check logs
npm run dev  # Should show connection status
```

### Frontend Shows Loading Forever

```bash
# 1. Check if backend is running
curl http://localhost:5000/

# 2. Check browser console for errors
# Open DevTools → Console tab

# 3. Check CORS settings in backend/server.js
# Should have: app.use(cors())

# 4. Network tab should show request to http://localhost:5000/api/recipes
```

### Recipes Not Displaying

```bash
# 1. Verify database has data
cd backend
npm run seed

# 2. Test API directly
curl http://localhost:5000/api/recipes | jq

# 3. Check browser console for parsing errors
# Open DevTools → Console tab

# 4. Verify ingredients format
# API returns: "Chicken - 500g"
# Frontend parses to: ["Chicken", 500, "g"]
```

### Serving Quantity Not Adjusting

```bash
# 1. Check Redux DevTools
# Action should be dispatched when clicking +/- buttons

# 2. Verify calculation in Recipes.jsx
// Should multiply quantity by (servings / 4)

# 3. Check if selectedRecipe has ingredients array
// Should be parsed by parseIngredients() function
```

---

## 📸 SCREENSHOTS TO TAKE

For your college submission, capture these:

1. **Homepage** - Full page with recipe grid
2. **Mobile View** - Same page on mobile device
3. **Recipe Modal** - Open recipe with all details
4. **Favorites** - Recipe marked as favorite (orange heart)
5. **Serving Adjustment** - Before and after quantity changes
6. **Search Results** - Filtered recipes by category
7. **Error State** - When backend is offline
8. **Backend Terminal** - Server running with MongoDB connection
9. **MongoDB Atlas** - Collections showing 14 recipes
10. **API Response** - GET /api/recipes response in Postman

---

## 📝 KEY FILES MODIFIED/CREATED

### New Files:
- `backend/seed.js` - Database seeding script
- `backend/.gitignore` - Git ignore for backend

### Modified Files:
- `backend/package.json` - Added "seed" script
- `src/components/Recipes.jsx` - API integration + loading/error states

### Existing Files (Unchanged):
- `backend/server.js` ✅ Complete
- `backend/models/Recipe.js` ✅ Complete
- `backend/routes/recipeRoutes.js` ✅ Complete (includes DELETE)
- `src/redux/store.js` ✅ Complete
- `src/redux/recipeSlice.js` ✅ Complete
- `src/context/RecipePreferencesContext.jsx` ✅ Complete
- `src/hooks/useDebounce.js` ✅ Complete
- `src/hooks/useLocalStorage.js` ✅ Complete
- All UI components ✅ Complete with Tailwind CSS

---

## ✨ SUMMARY

Your RecipeVerse AI project now fully satisfies all four experiments:

| Experiment | Status | Key Features |
|-----------|--------|-------------|
| 1 | ✅ Complete | Tailwind CSS, Responsive design, 5 sections |
| 2 | ✅ Complete | useState, useEffect, useContext, 2 custom hooks |
| 3 | ✅ Complete | Redux store, 6 actions, favorites + servings |
| 4 | ✅ Complete | REST API, MongoDB, CRUD operations, seed script |

**Ready to deploy! 🚀**
