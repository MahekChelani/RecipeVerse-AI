import mongoose from "mongoose";
import dotenv from "dotenv";
import Recipe from "./models/Recipe.js";

dotenv.config({ path: "./.env" });

const MONGO_URI = process.env.MONGO_URI;

const normalizeName = (value) => value.trim().toLowerCase();

const recipeImageFallback =
  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80";

const createDishImageUrl = (recipeName, seed, index) => {
  const normalizedName = String(recipeName || "delicious dish").trim();
  const primary = `${normalizedName} ${seed || "food"}`.trim();
  const query = encodeURIComponent(primary.replace(/\s+/g, " "));
  const base = `https://images.unsplash.com/featured/?${query}`;

  if (index === 0) {
    return base;
  }

  return `${base}&v=${index}`;
};

const assignUniqueImages = (recipes) => {
  const usedImages = new Set();

  return recipes.map((recipe, index) => {
    const name = String(recipe.name || `Recipe ${index + 1}`).trim();
    const country = String(recipe.country || "global").trim();
    const meal = String(recipe.meal || "meal").trim();

    const declaredImage = String(recipe.image || "").trim();
    let candidate = declaredImage.startsWith("https://images.unsplash.com/photo-") && !usedImages.has(declaredImage)
      ? declaredImage
      : createDishImageUrl(name, `${country} ${meal}`.trim(), index);
    let counter = 1;

    while (usedImages.has(candidate)) {
      const suffix = `${name} ${country} ${meal} ${counter}`;
      candidate = `https://images.unsplash.com/featured/?${encodeURIComponent(suffix.replace(/\s+/g, " "))}&v=${index + counter}`;
      counter += 1;
    }

    usedImages.add(candidate);

    return {
      ...recipe,
      image: candidate || recipeImageFallback
    };
  });
};

const validateRecipeImageAssignments = (recipes) => {
  const imageCounts = new Map();
  let missingImages = 0;

  recipes.forEach((recipe) => {
    const image = typeof recipe.image === "string" ? recipe.image.trim() : "";

    if (!image) {
      missingImages += 1;
      return;
    }

    imageCounts.set(image, (imageCounts.get(image) || 0) + 1);
  });

  const duplicates = [...imageCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([url, count]) => ({ url, count }));

  console.log("Recipe image validation");
  console.log("-----------------------");
  console.log(`Total recipes: ${recipes.length}`);
  console.log(`Unique images: ${imageCounts.size}`);
  console.log(`Duplicate images: ${duplicates.length}`);
  console.log(`Missing images: ${missingImages}`);

  if (duplicates.length > 0) {
    console.warn("Duplicate image assignment detected:", duplicates.slice(0, 10));
  }

  if (missingImages > 0 || duplicates.length > 0) {
    throw new Error("Duplicate or missing recipe images detected. Fix the image assignment before inserting recipes.");
  }
};

const recipeCatalog = [
  {
    name: "Butter Chicken",
    category: "Indian",
    country: "India",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A rich and aromatic North Indian curry of tender chicken simmered in a velvety tomato and butter sauce with warm spices.",
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g chicken thigh pieces",
      "2 tbsp butter",
      "1 large onion, finely chopped",
      "3 garlic cloves, minced",
      "1 tbsp ginger paste",
      "1 cup tomato puree",
      "1/2 cup cream",
      "1 tsp turmeric",
      "1 tsp garam masala",
      "1 tsp cumin",
      "salt to taste"
    ],
    instructions: [
      "Marinate the chicken with yogurt, turmeric, and salt for at least 20 minutes.",
      "Sear the chicken in a hot pan until lightly browned and set aside.",
      "Cook onion, garlic, and ginger in butter until fragrant and soft.",
      "Add tomato puree, cumin, and garam masala; simmer until the sauce thickens.",
      "Return the chicken to the pan and cook until tender.",
      "Finish with cream and a final swirl of butter before serving."
    ],
    substitutions: [
      "Chicken → Paneer",
      "Cream → Coconut cream",
      "Butter → Olive oil"
    ]
  },
  {
    name: "Hyderabadi Biryani",
    category: "Indian",
    country: "India",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A fragrant layered biryani with basmati rice, saffron, spices, and slow-cooked meat or vegetables.",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 cups basmati rice",
      "500 g chicken or lamb",
      "2 large onions, sliced",
      "1/2 cup yogurt",
      "2 tbsp ginger-garlic paste",
      "1 tsp turmeric",
      "2 tsp biryani masala",
      "1/4 tsp saffron soaked in warm milk",
      "2 tbsp mint leaves",
      "2 tbsp coriander leaves",
      "2 tbsp cooking oil"
    ],
    instructions: [
      "Cook the basmati rice until 70% done and drain.",
      "Marinate the meat with yogurt, spices, and ginger-garlic paste.",
      "Fry the onions until deep golden brown and set aside.",
      "Layer rice and marinated meat in a heavy pot with mint, coriander, and saffron.",
      "Seal and cook on low heat until the meat is tender and the rice is fully cooked.",
      "Rest for 10 minutes before opening and serving."
    ],
    substitutions: [
      "Chicken → Paneer",
      "Rice → Brown rice",
      "Saffron → Turmeric"
    ]
  },
  {
    name: "Paneer Butter Masala",
    category: "Vegetarian",
    country: "India",
    continent: "Asia",
    meal: "Dinner",
    description:
      "Soft paneer cubes cooked in a creamy tomato gravy enriched with butter and a hint of kasuri methi.",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "300 g paneer, cubed",
      "2 tbsp butter",
      "1 onion, chopped",
      "3 tomatoes, chopped",
      "1 tbsp ginger-garlic paste",
      "1 tsp red chilli powder",
      "1/2 tsp turmeric",
      "1/2 cup cream",
      "1 tsp kasuri methi",
      "salt to taste"
    ],
    instructions: [
      "Blend the tomato and onion into a smooth sauce.",
      "Cook the puree with ginger-garlic and spices until thick and glossy.",
      "Add the paneer and simmer gently.",
      "Stir in the cream and kasuri methi.",
      "Adjust seasoning and finish with a little butter.",
      "Serve hot with naan or rice."
    ],
    substitutions: [
      "Paneer → Tofu",
      "Cream → Cashew cream",
      "Butter → Plant butter"
    ]
  },
  {
    name: "Masala Dosa",
    category: "South Indian",
    country: "India",
    continent: "Asia",
    meal: "Breakfast",
    description:
      "A crisp fermented rice-and-lentil crepe filled with a savory potato masala and served with chutney.",
    image:
      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 cups dosa batter",
      "3 medium potatoes, boiled and cubed",
      "1 onion, chopped",
      "2 green chilies, sliced",
      "1 tsp mustard seeds",
      "1/2 tsp turmeric",
      "1 tbsp oil",
      "1/2 cup grated coconut",
      "salt to taste",
      "coconut chutney, for serving"
    ],
    instructions: [
      "Cook onion, mustard seeds, chili, and turmeric in oil until fragrant.",
      "Add potatoes and salt, then lightly mash to form the masala.",
      "Heat a dosa pan and spread a thin layer of batter into a circle.",
      "Drizzle a little oil around the edges and cook until crisp.",
      "Place the potato filling in the center and fold the dosa.",
      "Serve with coconut chutney and sambar."
    ],
    substitutions: [
      "Potatoes → Sweet potatoes",
      "Coconut → Peanut chutney",
      "Rice batter → Oats batter"
    ]
  },
  {
    name: "Chole Bhature",
    category: "North Indian",
    country: "India",
    continent: "Asia",
    meal: "Lunch",
    description:
      "Spiced chickpea curry served with deep-fried flour bread, a classic comfort food from Northern India.",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "400 g chickpeas, soaked and boiled",
      "2 cups all-purpose flour",
      "1 tsp baking powder",
      "1 tbsp yogurt",
      "1 onion, chopped",
      "2 tomatoes, chopped",
      "1 tbsp ginger-garlic paste",
      "2 tsp chole masala",
      "1 tsp cumin",
      "1 tbsp oil"
    ],
    instructions: [
      "Prepare a soft dough for bhature with flour, yogurt, baking powder, and water.",
      "Cook onion, tomato, and ginger-garlic until the mixture thickens.",
      "Add chickpeas, chole masala, cumin, and simmer until rich and saucy.",
      "Deep-fry small bhature dough rounds until puffed and golden.",
      "Serve the chole hot with bhature and pickled onions.",
      "Finish with cilantro and fresh lemon on top."
    ],
    substitutions: [
      "Chickpeas → White beans",
      "All-purpose flour → Whole wheat flour",
      "Bhature → Naan"
    ]
  },
  {
    name: "Palak Paneer",
    category: "Vegetarian",
    country: "India",
    continent: "Asia",
    meal: "Dinner",
    description:
      "Creamy spinach gravy with cubes of paneer, finished with warm spices and a touch of cream.",
    image:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "300 g paneer",
      "4 cups spinach leaves",
      "1 onion, chopped",
      "2 garlic cloves",
      "1 green chili",
      "1/2 cup cream",
      "1 tsp cumin",
      "1/2 tsp garam masala",
      "1 tbsp butter",
      "salt to taste"
    ],
    instructions: [
      "Blanch spinach and blend it with garlic and green chili into a smooth puree.",
      "Cook onion in butter until soft and fragrant.",
      "Add cumin and garam masala, then stir in the spinach puree.",
      "Simmer gently and add cream for a silky finish.",
      "Fold in the paneer cubes and warm through without overcooking.",
      "Serve with roti or jeera rice."
    ],
    substitutions: [
      "Paneer → Tofu",
      "Spinach → Kale",
      "Cream → Cashew paste"
    ]
  },
  {
    name: "Pav Bhaji",
    category: "Street Food",
    country: "India",
    continent: "Asia",
    meal: "Lunch",
    description:
      "A buttery vegetable mash served with toasted buns and a colorful array of toppings and chutneys.",
    image:
      "https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "3 potatoes, boiled",
      "1 cup peas",
      "1 capsicum, chopped",
      "2 tomatoes, chopped",
      "1 onion, chopped",
      "2 tbsp pav bhaji masala",
      "1 tbsp butter",
      "4 buns",
      "1 lemon",
      "salt to taste"
    ],
    instructions: [
      "Cook the vegetables until soft and mash them lightly.",
      "Add pav bhaji masala, butter, and salt, then simmer to create a thick gravy.",
      "Toast the buns with butter until golden.",
      "Spoon the bhaji generously on the buns.",
      "Top with onion, lemon juice, and cilantro.",
      "Serve immediately with fried chili and chutney."
    ],
    substitutions: [
      "Potatoes → Cauliflower",
      "Buns → Toasted bread",
      "Butter → Ghee"
    ]
  },
  {
    name: "Rajma Masala",
    category: "Vegetarian",
    country: "India",
    continent: "Asia",
    meal: "Dinner",
    description:
      "Slow-cooked red kidney beans in a tomato-onion gravy infused with warming Indian spices.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "300 g kidney beans, soaked",
      "1 onion, chopped",
      "2 tomatoes, pureed",
      "1 tbsp ginger-garlic paste",
      "1 tsp cumin",
      "1 tsp coriander powder",
      "1 tsp garam masala",
      "1 tbsp oil",
      "1/2 tsp turmeric",
      "salt to taste"
    ],
    instructions: [
      "Cook the kidney beans until soft and tender.",
      "Sauté onion and ginger-garlic in oil until golden.",
      "Add tomatoes and all spices, then simmer until the sauce thickens.",
      "Add the beans and enough water to achieve a saucy consistency.",
      "Cook on low heat until richly flavored.",
      "Finish with fresh coriander and serve with rice."
    ],
    substitutions: [
      "Kidney beans → Black beans",
      "Tomato → Coconut milk",
      "Rice → Jeera rice"
    ]
  },
  {
    name: "Dal Tadka",
    category: "Vegetarian",
    country: "India",
    continent: "Asia",
    meal: "Lunch",
    description:
      "Yellow lentils cooked to a smooth, comforting finish and topped with a sizzling garlic and spice tempering.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "1 cup yellow lentils",
      "1 onion, finely sliced",
      "3 garlic cloves, sliced",
      "1 green chili, chopped",
      "1/2 tsp cumin",
      "1/2 tsp turmeric",
      "1 tbsp ghee",
      "1 tomato, chopped",
      "1/2 cup fresh coriander",
      "salt to taste"
    ],
    instructions: [
      "Wash and cook the lentils with turmeric and water until soft.",
      "Mash lightly to achieve a creamy consistency.",
      "Heat ghee and temper cumin, onion, garlic, and green chili.",
      "Add tomato and cook until it softens.",
      "Pour the tempering into the dal and simmer briefly.",
      "Finish with coriander and serve with rice or roti."
    ],
    substitutions: [
      "Yellow lentils → Red lentils",
      "Ghee → Olive oil",
      "Coriander → Mint"
    ]
  },
  {
    name: "Sushi",
    category: "Japanese",
    country: "Japan",
    continent: "Asia",
    meal: "Dinner",
    description:
      "Delicate vinegared rice paired with fresh seafood, vegetables, and umami-rich seasonings.",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 cups sushi rice",
      "2 tbsp rice vinegar",
      "1 tbsp sugar",
      "1 tsp salt",
      "200 g salmon",
      "200 g tuna",
      "1 cucumber, julienned",
      "1 avocado, sliced",
      "4 sheets nori",
      "soy sauce for serving"
    ],
    instructions: [
      "Cook the sushi rice and season it with rice vinegar, sugar, and salt.",
      "Cool the rice to room temperature while preparing the fillings.",
      "Lay a sheet of nori on a bamboo mat and spread rice evenly over it.",
      "Add salmon, tuna, cucumber, and avocado in a line.",
      "Roll tightly and slice into bite-size pieces.",
      "Serve with soy sauce, pickled ginger, and wasabi."
    ],
    substitutions: [
      "Salmon → Tofu",
      "Rice → Cauliflower rice",
      "Seafood → Avocado rolls"
    ]
  },
  {
    name: "Chicken Teriyaki",
    category: "Japanese",
    country: "Japan",
    continent: "Asia",
    meal: "Dinner",
    description:
      "Japanese-style glazed chicken with a sweet-salty soy-based sauce and a glossy finish.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g chicken thighs",
      "2 tbsp soy sauce",
      "1 tbsp mirin",
      "1 tbsp sake",
      "1 tbsp sugar",
      "1 tsp ginger, grated",
      "2 garlic cloves, minced",
      "1 tbsp sesame oil",
      "1 spring onion, sliced",
      "1 tsp sesame seeds"
    ],
    instructions: [
      "Mix soy sauce, mirin, sake, sugar, ginger, and garlic to make the glaze.",
      "Pan-sear the chicken until evenly browned on both sides.",
      "Pour in the glaze and simmer until the sauce thickens and coats the chicken.",
      "Turn the chicken occasionally so it absorbs the flavor.",
      "Finish with sesame oil and garnish with spring onion and sesame seeds.",
      "Serve with rice and steamed vegetables."
    ],
    substitutions: [
      "Chicken → Tofu",
      "Mirin → Rice vinegar",
      "Soy → Tamari"
    ]
  },
  {
    name: "Chicken Katsu",
    category: "Japanese",
    country: "Japan",
    continent: "Asia",
    meal: "Dinner",
    description:
      "Crispy breaded chicken cutlet served with rice, shredded cabbage, and savory tonkatsu sauce.",
    image:
      "https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "4 chicken cutlets",
      "1 cup panko breadcrumbs",
      "1 egg",
      "1/2 cup flour",
      "1 tbsp cornstarch",
      "1/2 head cabbage, shredded",
      "2 tbsp vegetable oil",
      "2 tbsp tonkatsu sauce",
      "1 tsp salt",
      "pepper to taste"
    ],
    instructions: [
      "Season the chicken and dust lightly with flour.",
      "Dip in beaten egg then coat with panko breadcrumbs.",
      "Shallow-fry the cutlets until golden and crisp.",
      "Drain on paper towels and slice into strips.",
      "Serve on rice with shredded cabbage and tonkatsu sauce.",
      "Add a side of pickles or miso soup if desired."
    ],
    substitutions: [
      "Chicken → Pork",
      "Panko → Cornflake crumbs",
      "Tonkatsu sauce → BBQ sauce"
    ]
  },
  {
    name: "Okonomiyaki",
    category: "Japanese",
    country: "Japan",
    continent: "Asia",
    meal: "Brunch",
    description:
      "A savory Japanese pancake packed with cabbage, seafood or pork, and finished with sauces and bonito flakes.",
    image:
      "https://images.unsplash.com/photo-1617196034796-73dfa68d9c6c?auto=format&fit=crop&w=1200&q=80",
    servings: 2,
    ingredients: [
      "1 cup flour",
      "1 cup shredded cabbage",
      "2 eggs",
      "3/4 cup dashi stock",
      "1/2 cup cooked pork belly",
      "2 tbsp mayonnaise",
      "1 tbsp okonomiyaki sauce",
      "1 tbsp bonito flakes",
      "1 tsp sesame seeds",
      "1 tbsp vegetable oil"
    ],
    instructions: [
      "Mix the batter with flour, eggs, and dashi until smooth.",
      "Fold in cabbage and the selected filling.",
      "Pour the mixture onto a hot skillet and press gently.",
      "Cook until the bottom is set and golden, then flip carefully.",
      "Brown the other side and finish with sauce, mayonnaise, and bonito flakes.",
      "Serve hot with extra sauce and pickled vegetables."
    ],
    substitutions: [
      "Pork → Shrimp",
      "Flour → Rice flour",
      "Dashi → Vegetable stock"
    ]
  },
  {
    name: "Ramen",
    category: "Japanese",
    country: "Japan",
    continent: "Asia",
    meal: "Dinner",
    description:
      "Slurp-worthy noodles in a steaming broth of pork, miso, or shoyu with tender toppings and rich umami.",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "400 g ramen noodles",
      "1 liter chicken broth",
      "2 tbsp soy sauce",
      "1 tbsp miso",
      "2 soft-boiled eggs",
      "200 g sliced pork belly",
      "1 cup spinach",
      "2 green onions, sliced",
      "1 tbsp sesame oil",
      "1 tsp chili oil"
    ],
    instructions: [
      "Bring the broth to a gentle simmer and season with soy sauce and miso.",
      "Cook the ramen noodles in boiling water until just tender.",
      "Blanch the spinach briefly and arrange with the pork and eggs.",
      "Divide noodles into bowls and ladle in the broth.",
      "Top with pork, eggs, green onions, and chili oil.",
      "Serve immediately while hot and aromatic."
    ],
    substitutions: [
      "Pork → Tofu",
      "Broth → Mushroom broth",
      "Eggs → Edamame"
    ]
  },
  {
    name: "Kung Pao Chicken",
    category: "Chinese",
    country: "China",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A bold Sichuan-inspired stir-fry with chicken, peanuts, chili peppers, and a savory sauce.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g chicken breast, diced",
      "1 tbsp soy sauce",
      "1 tbsp Shaoxing wine",
      "1 tsp cornstarch",
      "1/2 cup peanuts",
      "2 dried chilies",
      "1 red bell pepper, sliced",
      "2 scallions, chopped",
      "1 tbsp ginger, minced",
      "2 tbsp vegetable oil"
    ],
    instructions: [
      "Marinate the chicken with soy sauce, Shaoxing wine, and cornstarch.",
      "Heat oil and stir-fry the chicken until nearly cooked.",
      "Add chilies, ginger, bell pepper, and scallions.",
      "Pour in a quick sauce and toss until glossy.",
      "Stir in peanuts just before serving.",
      "Serve with steamed rice."
    ],
    substitutions: [
      "Chicken → Tofu",
      "Peanuts → Cashews",
      "Shaoxing wine → Rice vinegar"
    ]
  },
  {
    name: "Mapo Tofu",
    category: "Chinese",
    country: "China",
    continent: "Asia",
    meal: "Dinner",
    description:
      "Silken tofu in a fiery, savory sauce with minced meat, Sichuan pepper, and fermented bean paste.",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "300 g firm tofu, cubed",
      "200 g minced beef or pork",
      "1 tbsp doubanjiang",
      "1 tbsp soy sauce",
      "1 tsp chili bean paste",
      "1 tsp ginger, minced",
      "2 garlic cloves, minced",
      "1 tbsp sesame oil",
      "1 tsp Sichuan pepper",
      "1 spring onion, sliced"
    ],
    instructions: [
      "Bring the tofu to a gentle simmer in water and remove carefully.",
      "Cook the minced meat with ginger and garlic until fragrant.",
      "Add doubanjiang and chili bean paste, then stir well.",
      "Return the tofu and add soy sauce and a splash of water.",
      "Simmer until the sauce thickens and the flavors meld.",
      "Garnish with spring onion and serve piping hot."
    ],
    substitutions: [
      "Beef → Mushrooms",
      "Doubanjiang → Chili paste",
      "Tofu → Tempeh"
    ]
  },
  {
    name: "Chow Mein",
    category: "Chinese",
    country: "China",
    continent: "Asia",
    meal: "Dinner",
    description:
      "Wok-tossed noodles with vegetables, soy, and a savory umami sauce for a street-food classic feel.",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "300 g egg noodles",
      "200 g chicken or shrimp",
      "1 carrot, julienned",
      "1 cup bok choy",
      "1 red bell pepper",
      "2 tbsp soy sauce",
      "1 tbsp oyster sauce",
      "1 tbsp sesame oil",
      "2 garlic cloves, minced",
      "1 tbsp vegetable oil"
    ],
    instructions: [
      "Boil the noodles until just tender, then rinse and drain.",
      "Stir-fry the protein with garlic until cooked through.",
      "Add vegetables and cook until crisp-tender.",
      "Toss in noodles and the combined sauces.",
      "Stir-fry until evenly coated and glossy.",
      "Finish with sesame oil and serve immediately."
    ],
    substitutions: [
      "Chicken → Tofu",
      "Egg noodles → Rice noodles",
      "Oyster sauce → Hoisin"
    ]
  },
  {
    name: "Fried Rice",
    category: "Chinese",
    country: "China",
    continent: "Asia",
    meal: "Lunch",
    description:
      "A classic wok-fried rice dish with vegetables, eggs, and savory seasoning for bright, satisfying flavor.",
    image:
      "https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "3 cups cooked rice",
      "2 eggs, beaten",
      "1 cup mixed vegetables",
      "150 g ham or tofu",
      "2 tbsp soy sauce",
      "1 tbsp oyster sauce",
      "1 tsp sesame oil",
      "2 garlic cloves, minced",
      "1 tsp ginger, grated",
      "2 tbsp oil"
    ],
    instructions: [
      "Cook the rice until cold and grains are separate.",
      "Scramble the eggs in a little oil and set aside.",
      "Stir-fry garlic and ginger before adding vegetables and protein.",
      "Add rice and toss thoroughly to break up clumps.",
      "Season with soy sauce and oyster sauce, then mix in the eggs.",
      "Finish with sesame oil and serve warm."
    ],
    substitutions: [
      "Ham → Mushrooms",
      "Rice → Cauliflower rice",
      "Eggs → Extra tofu"
    ]
  },
  {
    name: "Spring Rolls",
    category: "Chinese",
    country: "China",
    continent: "Asia",
    meal: "Appetizer",
    description:
      "Golden, crispy rolls filled with vegetables and protein, served with a savory dipping sauce.",
    image:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "8 spring roll wrappers",
      "150 g shredded chicken",
      "1 cup cabbage, shredded",
      "1 carrot, julienned",
      "1/2 cup bean sprouts",
      "2 tbsp soy sauce",
      "1 tbsp cornstarch",
      "1 egg white",
      "oil for frying",
      "sweet chili sauce"
    ],
    instructions: [
      "Stir-fry the chicken and vegetables until just cooked and flavorful.",
      "Cool the filling completely before wrapping.",
      "Roll the wrappers tightly with a little cornstarch paste to seal them.",
      "Deep-fry in hot oil until crisp and golden.",
      "Drain on paper towels and serve hot.",
      "Pair with sweet chili or soy dipping sauce."
    ],
    substitutions: [
      "Chicken → Tofu",
      "Wrappers → Rice paper",
      "Sweet chili → Plum sauce"
    ]
  },
  {
    name: "Bibimbap",
    category: "Korean",
    country: "South Korea",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A colorful Korean rice bowl layered with vegetables, beef, egg, and gochujang sauce.",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 cups cooked rice",
      "200 g beef bulgogi",
      "1 carrot, julienned",
      "1 cucumber, sliced",
      "1 cup spinach",
      "2 eggs",
      "2 tbsp gochujang",
      "1 tbsp sesame oil",
      "1 tbsp soy sauce",
      "1 tbsp sesame seeds"
    ],
    instructions: [
      "Cook the beef with soy sauce and sesame oil until glazed.",
      "Sauté or blanch the vegetables separately to preserve texture.",
      "Cook the eggs sunny-side up or fried.",
      "Arrange rice and toppings in a bowl in a colorful pattern.",
      "Add gochujang sauce over the top and mix just before eating.",
      "Finish with sesame seeds and extra chili if desired."
    ],
    substitutions: [
      "Beef → Mushrooms",
      "Gochujang → Sriracha",
      "Rice → Brown rice"
    ]
  },
  {
    name: "Bulgogi",
    category: "Korean",
    country: "South Korea",
    continent: "Asia",
    meal: "Dinner",
    description:
      "Thin slices of beef marinated in soy, pear, garlic, and sesame for a deeply savory Korean favorite.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g beef ribeye, thinly sliced",
      "2 tbsp soy sauce",
      "1 tbsp pear juice",
      "1 tbsp sesame oil",
      "2 garlic cloves, minced",
      "1 tsp ginger, grated",
      "1 tbsp sugar",
      "1 carrot, sliced",
      "1 onion, sliced",
      "2 tbsp cooking oil"
    ],
    instructions: [
      "Mix the soy sauce, pear juice, garlic, ginger, sugar, and sesame oil to make the marinade.",
      "Toss the beef with the marinade and chill for 20 to 30 minutes.",
      "Sear the beef in a hot pan until lightly caramelized.",
      "Add onion and carrot and stir-fry until tender.",
      "Cook until the sauce reduces to a glossy glaze.",
      "Serve with rice and lettuce wraps."
    ],
    substitutions: [
      "Beef → Chicken",
      "Pear juice → Apple juice",
      "Rice → Quinoa"
    ]
  },
  {
    name: "Korean Fried Chicken",
    category: "Korean",
    country: "South Korea",
    continent: "Asia",
    meal: "Dinner",
    description:
      "Crispy, double-fried Korean chicken glazed with a sticky spicy-sweet sauce and sesame notes.",
    image:
      "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "600 g chicken wings or drumsticks",
      "1 cup flour",
      "1/2 cup cornstarch",
      "1 egg",
      "1 tbsp soy sauce",
      "1 tbsp rice vinegar",
      "2 tbsp gochujang",
      "2 tbsp honey",
      "1 tbsp garlic, minced",
      "2 tbsp oil"
    ],
    instructions: [
      "Marinate the chicken with soy sauce and a little salt.",
      "Coat in flour and cornstarch, then fry until crisp and golden.",
      "Prepare the glaze by simmering gochujang, honey, garlic, and vinegar.",
      "Coat the fried chicken in the glaze until fully covered.",
      "Serve with pickled radish and extra chili flakes.",
      "Finish with sesame seeds and a squeeze of lime."
    ],
    substitutions: [
      "Chicken → Cauliflower bites",
      "Gochujang → Chili sauce",
      "Flour → Gluten-free flour"
    ]
  },
  {
    name: "Kimchi Fried Rice",
    category: "Korean",
    country: "South Korea",
    continent: "Asia",
    meal: "Dinner",
    description:
      "Leftover rice transformed into a savory Korean classic with kimchi, egg, and bold fermented flavor.",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "3 cups cooked rice",
      "1 cup kimchi, chopped",
      "2 eggs",
      "1 onion, sliced",
      "1 tbsp gochujang",
      "1 tbsp soy sauce",
      "1 tsp sesame oil",
      "1 tbsp vegetable oil",
      "2 scallions, chopped",
      "1 tbsp sesame seeds"
    ],
    instructions: [
      "Heat the oil and cook onion until softened.",
      "Add kimchi and gochujang, then stir-fry until fragrant.",
      "Add the rice and break up any clumps with a spatula.",
      "Toss in soy sauce and sesame oil for seasoning.",
      "Top with fried eggs and scallions before serving.",
      "Finish with sesame seeds and extra kimchi if desired."
    ],
    substitutions: [
      "Kimchi → Sauerkraut",
      "Egg → Tofu",
      "Rice → Quinoa"
    ]
  },
  {
    name: "Japchae",
    category: "Korean",
    country: "South Korea",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A colorful Korean stir-fry of sweet potato noodles, vegetables, and beef in a lightly sweet soy glaze.",
    image:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "200 g sweet potato glass noodles",
      "200 g beef strips",
      "1 carrot, shredded",
      "1 onion, sliced",
      "1 cup spinach",
      "2 mushrooms, sliced",
      "2 tbsp soy sauce",
      "1 tbsp sugar",
      "1 tbsp sesame oil",
      "1 tbsp vegetable oil"
    ],
    instructions: [
      "Cook the noodles until soft, rinse, and drain well.",
      "Season the beef with soy sauce and sauté until cooked.",
      "Stir-fry the vegetables separately until crisp-tender.",
      "Combine noodles, protein, and vegetables in a large pan.",
      "Add sugar, sesame oil, and extra soy sauce to coat evenly.",
      "Serve warm and garnish with sesame seeds."
    ],
    substitutions: [
      "Beef → Tofu",
      "Glass noodles → Rice noodles",
      "Spinach → Bok choy"
    ]
  },
  {
    name: "Tteokbokki",
    category: "Korean",
    country: "South Korea",
    continent: "Asia",
    meal: "Snack",
    description:
      "Chewy rice cakes simmered in a fiery sweet-spicy gochujang sauce with scallions and sesame.",
    image:
      "https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "400 g rice cakes",
      "2 tbsp gochujang",
      "1 tbsp gochugaru",
      "1 tbsp soy sauce",
      "1 tbsp sugar",
      "1 cup water",
      "1 onion, sliced",
      "2 scallions, chopped",
      "1 tsp sesame oil",
      "1 tbsp sesame seeds"
    ],
    instructions: [
      "Combine gochujang, gochugaru, soy sauce, sugar, and water in a saucepan.",
      "Bring to a simmer, then add the onion and rice cakes.",
      "Cook until the sauce thickens and the rice cakes soften.",
      "Add scallions and stir well.",
      "Finish with sesame oil and sesame seeds.",
      "Serve hot and enjoy the glossy sauce."
    ],
    substitutions: [
      "Rice cakes → Potato slices",
      "Gochujang → Chili paste",
      "Onion → Bell pepper"
    ]
  },
  {
    name: "Pad Thai",
    category: "Thai",
    country: "Thailand",
    continent: "Asia",
    meal: "Dinner",
    description:
      "Thai stir-fried rice noodles with tamarind sauce, peanuts, bean sprouts, and a balance of sweet, salty, and sour.",
    image:
      "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "300 g rice noodles",
      "200 g chicken or tofu",
      "2 eggs",
      "1 cup bean sprouts",
      "1 carrot, shredded",
      "2 tbsp tamarind paste",
      "2 tbsp fish sauce",
      "1 tbsp palm sugar",
      "2 tbsp peanuts, chopped",
      "2 tbsp oil"
    ],
    instructions: [
      "Soak and cook the noodles until tender, then drain.",
      "Stir-fry the chicken or tofu with a little oil until cooked.",
      "Push the protein aside and scramble the eggs in the wok.",
      "Add noodles, tamarind paste, fish sauce, and palm sugar.",
      "Toss in bean sprouts, carrot, and peanuts until all is coated and heated.",
      "Serve with lime wedges and chili flakes."
    ],
    substitutions: [
      "Chicken → Tofu",
      "Fish sauce → Soy sauce",
      "Rice noodles → Rice vermicelli"
    ]
  },
  {
    name: "Thai Green Curry",
    category: "Thai",
    country: "Thailand",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A fragrant green curry made with fresh herbs, coconut milk, and tender vegetables and protein.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "400 ml coconut milk",
      "200 g chicken or tofu",
      "1 cup bamboo shoots",
      "1 eggplant, cubed",
      "1 bell pepper, sliced",
      "2 tbsp green curry paste",
      "1 tbsp fish sauce",
      "1 tbsp palm sugar",
      "1 basil sprig",
      "1 tbsp oil"
    ],
    instructions: [
      "Warm the coconut milk in a pot until fragrant, then add curry paste.",
      "Cook the paste briefly before adding the protein and vegetables.",
      "Pour in the remaining coconut milk and simmer gently.",
      "Season with fish sauce and palm sugar until balanced.",
      "Add basil at the end and cook until wilted.",
      "Serve with steamed jasmine rice."
    ],
    substitutions: [
      "Chicken → Chickpeas",
      "Fish sauce → Soy sauce",
      "Eggplant → Zucchini"
    ]
  },
  {
    name: "Tom Yum",
    category: "Thai",
    country: "Thailand",
    continent: "Asia",
    meal: "Soup",
    description:
      "A hot and sour Thai soup with lemongrass, kaffir lime, mushrooms, and aromatics.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "1 liter broth",
      "200 g shrimp",
      "1 cup mushrooms",
      "1 lemongrass stalk",
      "2 kaffir lime leaves",
      "1 tbsp lime juice",
      "1 tbsp fish sauce",
      "1 tsp chili paste",
      "2 tbsp cilantro",
      "1 tbsp oil"
    ],
    instructions: [
      "Simmer the broth with lemongrass and kaffir lime leaves.",
      "Add mushrooms and shrimp and cook until the shrimp turn pink.",
      "Stir in chili paste, fish sauce, and lime juice.",
      "Adjust seasoning to create the hot and sour balance.",
      "Discard lemongrass before serving.",
      "Garnish with cilantro and serve immediately."
    ],
    substitutions: [
      "Shrimp → Chicken",
      "Fish sauce → Soy sauce",
      "Lime → Lemon"
    ]
  },
  {
    name: "Tom Kha Gai",
    category: "Thai",
    country: "Thailand",
    continent: "Asia",
    meal: "Soup",
    description:
      "A creamy coconut soup with galangal, lemongrass, chicken, and a subtly tangy finish.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g chicken",
      "400 ml coconut milk",
      "1 liter chicken stock",
      "2 slices galangal",
      "1 lemongrass stalk",
      "1 cup mushrooms",
      "1 tbsp fish sauce",
      "1 tbsp lime juice",
      "2 tbsp cilantro",
      "1 tbsp oil"
    ],
    instructions: [
      "Simmer stock with galangal, lemongrass, and chicken until the chicken is tender.",
      "Add mushrooms and coconut milk, then bring gently to a simmer.",
      "Season with fish sauce and lime juice.",
      "Allow the soup to steep for a few minutes.",
      "Discard the aromatics before serving.",
      "Finish with fresh cilantro and extra lime."
    ],
    substitutions: [
      "Chicken → Tofu",
      "Fish sauce → Soy sauce",
      "Coconut milk → Light coconut milk"
    ]
  },
  {
    name: "Massaman Curry",
    category: "Thai",
    country: "Thailand",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A rich and aromatic Thai curry with coconut milk, warm spices, potatoes, and roasted peanut depth.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g beef or chicken",
      "400 ml coconut milk",
      "2 potatoes, cubed",
      "1 onion, sliced",
      "2 tbsp massaman curry paste",
      "1 tbsp peanut butter",
      "1 tbsp fish sauce",
      "1 tbsp palm sugar",
      "1 tsp tamarind",
      "1 tbsp oil"
    ],
    instructions: [
      "Fry the curry paste in oil until fragrant.",
      "Add the protein and onion, then cook until lightly seared.",
      "Pour in coconut milk and simmer gently.",
      "Stir in potatoes, peanut butter, fish sauce, and palm sugar.",
      "Cook until the potatoes are soft and the curry is thick.",
      "Serve with rice and garnish with peanuts."
    ],
    substitutions: [
      "Beef → Chickpeas",
      "Peanut butter → Cashew butter",
      "Potatoes → Sweet potatoes"
    ]
  },
  {
    name: "Mango Sticky Rice",
    category: "Thai",
    country: "Thailand",
    continent: "Asia",
    meal: "Dessert",
    description:
      "Sweet coconut rice served with ripe mango and a drizzle of creamy coconut caramel.",
    image:
      "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "1 cup glutinous rice",
      "1 cup coconut milk",
      "2 tbsp sugar",
      "1/4 tsp salt",
      "2 ripe mangoes",
      "1 tbsp sesame seeds",
      "1 tbsp coconut cream",
      "1 tsp vanilla",
      "1 tbsp water"
    ],
    instructions: [
      "Soak the rice for at least 30 minutes and steam until tender.",
      "Warm coconut milk with sugar and salt until dissolved.",
      "Fold the coconut mixture into the warm rice.",
      "Slice the mango and arrange it with the rice on plates.",
      "Drizzle extra coconut cream and finish with sesame seeds.",
      "Serve chilled or at room temperature."
    ],
    substitutions: [
      "Mango → Pineapple",
      "Rice → Jasmine rice",
      "Sesame → Toasted coconut"
    ]
  },
  {
    name: "Pho",
    category: "Vietnamese",
    country: "Vietnam",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A deeply savory Vietnamese noodle soup with fragrant broth, herbs, and tender beef or chicken.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "1.5 liters beef broth",
      "200 g rice noodles",
      "300 g beef slices",
      "1 onion, charred",
      "2 ginger slices",
      "2 star anise",
      "1 tbsp fish sauce",
      "1 tsp sugar",
      "1 bunch fresh basil",
      "2 spring onions"
    ],
    instructions: [
      "Simmer the broth with ginger, onion, and star anise for aromatic depth.",
      "Strain the broth and season with fish sauce and sugar.",
      "Cook the noodles separately and divide among bowls.",
      "Top with raw beef slices and pour hot broth over them.",
      "Garnish with basil and spring onion.",
      "Serve with lime wedges and chili sauce."
    ],
    substitutions: [
      "Beef → Chicken",
      "Fish sauce → Soy sauce",
      "Rice noodles → Udon"
    ]
  },
  {
    name: "Banh Mi",
    category: "Vietnamese",
    country: "Vietnam",
    continent: "Asia",
    meal: "Lunch",
    description:
      "A Vietnamese sandwich with crisp baguette, savory fillings, herbs, and bright pickled vegetables.",
    image:
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "4 baguettes",
      "300 g grilled pork",
      "1 carrot, pickled",
      "1 cucumber, sliced",
      "1 jalapeño, sliced",
      "2 tbsp mayonnaise",
      "1 tbsp soy sauce",
      "1 tbsp lime juice",
      "1 bunch cilantro",
      "1 tbsp chili sauce"
    ],
    instructions: [
      "Prepare the pickled carrot and cucumber in a quick vinegar mixture.",
      "Slice the baguettes and spread with mayonnaise and chili sauce.",
      "Add the grilled pork and vegetables.",
      "Layer with cilantro and jalapeño.",
      "Press gently to compact the sandwich.",
      "Serve fresh and crisp."
    ],
    substitutions: [
      "Pork → Tofu",
      "Mayonnaise → Sriracha mayo",
      "Baguette → Ciabatta"
    ]
  },
  {
    name: "Bun Cha",
    category: "Vietnamese",
    country: "Vietnam",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A vibrant noodle bowl with grilled pork patties, fresh herbs, and a sweet-savory dipping sauce.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "300 g pork mince",
      "200 g rice noodles",
      "1 carrot, shredded",
      "1 cucumber, sliced",
      "1 bunch herbs",
      "2 tbsp fish sauce",
      "1 tbsp sugar",
      "1 tbsp vinegar",
      "1 tbsp chili flakes",
      "2 tbsp oil"
    ],
    instructions: [
      "Mix the pork with seasoning and shape into small patties.",
      "Grill or pan-sear the patties until caramelized and cooked.",
      "Prepare the dipping sauce with fish sauce, sugar, vinegar, and chili.",
      "Cook the noodles and divide them into bowls.",
      "Top with pork patties, herbs, cucumber, and carrot.",
      "Serve with dipping sauce on the side."
    ],
    substitutions: [
      "Pork → Chicken",
      "Fish sauce → Soy sauce",
      "Rice noodles → Udon"
    ]
  },
  {
    name: "Nasi Goreng",
    category: "Indonesian",
    country: "Indonesia",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A fragrant Indonesian fried rice flavored with kecap manis, chili, and a medley of aromatics.",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "3 cups cooked rice",
      "200 g chicken or shrimp",
      "2 eggs",
      "1 onion, sliced",
      "2 tbsp kecap manis",
      "1 tbsp soy sauce",
      "1 tbsp chili paste",
      "1 tsp shrimp paste",
      "1 cucumber, sliced",
      "2 tbsp oil"
    ],
    instructions: [
      "Sauté onion in oil until soft and translucent.",
      "Add protein and cook until done, then stir in chili paste and shrimp paste.",
      "Push to one side and scramble the eggs in the pan.",
      "Add the rice and toss with kecap manis and soy sauce.",
      "Season to taste and cook until the grains are coated and aromatic.",
      "Serve with cucumber and fried shallots."
    ],
    substitutions: [
      "Chicken → Tofu",
      "Kecap manis → Sweet soy",
      "Shrimp paste → Tamari"
    ]
  },
  { 
    name: "Beef Rendang",
    category: "Indonesian",
    country: "Indonesia",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A rich, slow-cooked beef curry with coconut milk and a deep spice profile that develops intensely savory depth.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g beef chuck",
      "600 ml coconut milk",
      "2 lemongrass stalks",
      "3 kaffir lime leaves",
      "1 onion, sliced",
      "2 tbsp ginger-garlic paste",
      "1 tbsp chili powder",
      "1 tsp turmeric",
      "1 tbsp oil",
      "salt to taste"
    ],
    instructions: [
      "Brown the beef lightly in a pot to develop flavor.",
      "Add onion, ginger-garlic, and all spices and cook until fragrant.",
      "Pour in coconut milk, lemongrass, and lime leaves.",
      "Simmer gently until the beef is tender and the sauce thickens.",
      "Continue cooking until the curry turns dark and rich.",
      "Serve with steamed rice and vegetables."
    ],
    substitutions: [
      "Beef → Jackfruit",
      "Coconut milk → Light coconut milk",
      "Chili powder → Paprika"
    ]
  },
  {
    name: "Satay",
    category: "Indonesian",
    country: "Indonesia",
    continent: "Asia",
    meal: "Dinner",
    description:
      "Grilled skewers of marinated meat served with a creamy, savory peanut dipping sauce.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g chicken or beef",
      "2 tbsp soy sauce",
      "1 tbsp lime juice",
      "1 tbsp turmeric",
      "1 tbsp cumin",
      "2 tbsp peanut butter",
      "1 tbsp ketupat sauce",
      "1 onion, chopped",
      "1 tbsp oil",
      "1 tbsp peanuts, crushed"
    ],
    instructions: [
      "Marinate the meat with soy sauce, lime juice, turmeric, and cumin.",
      "Thread onto skewers and grill until charred and tender.",
      "Whisk peanut butter with a little water, onion, and spices to make the sauce.",
      "Heat the sauce gently until smooth.",
      "Serve the skewers with the peanut sauce and cucumber.",
      "Add lime wedges and fresh herbs for brightness."
    ],
    substitutions: [
      "Beef → Tofu",
      "Peanut butter → Almond butter",
      "Soy sauce → Tamari"
    ]
  },
  {
    name: "Gado-Gado",
    category: "Indonesian",
    country: "Indonesia",
    continent: "Asia",
    meal: "Lunch",
    description:
      "An Indonesian salad of steamed vegetables, tofu, and eggs dressed in a rich peanut sauce.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "200 g tofu",
      "2 eggs",
      "1 cup green beans",
      "1 cup cabbage, shredded",
      "1 cucumber, sliced",
      "1 carrot, sliced",
      "1 tbsp peanut butter",
      "1 tbsp soy sauce",
      "1 tbsp lime juice",
      "1 tsp chili sauce"
    ],
    instructions: [
      "Boil or steam the vegetables until just tender.",
      "Cook tofu and eggs and slice them for serving.",
      "Blend peanut butter, soy sauce, lime juice, and chili sauce into a dressing.",
      "Arrange the vegetables, tofu, and egg on a serving platter.",
      "Drizzle generously with the peanut dressing.",
      "Serve as a fresh, savory lunch bowl."
    ],
    substitutions: [
      "Tofu → Tempeh",
      "Peanut butter → Tahini",
      "Egg → Edamame"
    ]
  },
  {
    name: "Nasi Lemak",
    category: "Malaysian",
    country: "Malaysia",
    continent: "Asia",
    meal: "Breakfast",
    description:
      "Malaysia’s beloved coconut rice dish served with sambal, cucumber, peanuts, and fried protein.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 cups jasmine rice",
      "1 cup coconut milk",
      "2 pandan leaves",
      "200 g fried chicken",
      "1 cucumber, sliced",
      "2 tbsp sambal",
      "1/4 cup peanuts",
      "1 boiled egg",
      "1 tbsp sugar",
      "salt to taste"
    ],
    instructions: [
      "Cook the rice with coconut milk and pandan leaves until fragrant and fluffy.",
      "Prepare the sambal and arrange the toppings.",
      "Serve the rice with cucumber, fried chicken, peanuts, and egg.",
      "Add a spoonful of sambal and extra lime if preferred.",
      "Plate neatly and serve warm.",
      "Enjoy as a hearty breakfast or lunch."
    ],
    substitutions: [
      "Chicken → Tofu",
      "Coconut milk → Light coconut milk",
      "Peanuts → Cashews"
    ]
  },
  {
    name: "Laksa",
    category: "Malaysian",
    country: "Malaysia",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A rich, spicy coconut noodle soup layered with herbs, seafood, and a creamy aromatic broth.",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "300 g rice noodles",
      "400 ml coconut milk",
      "200 g shrimp",
      "1 cup fish balls",
      "1 tbsp laksa paste",
      "1 lemongrass stalk",
      "1 tbsp tamarind",
      "1 cucumber, sliced",
      "1 bunch mint",
      "2 tbsp oil"
    ],
    instructions: [
      "Cook the laksa paste with oil until fragrant and glossy.",
      "Add coconut milk, broth, and tamarind and simmer.",
      "Add shrimp and fish balls until cooked.",
      "Cook the noodles and divide them between bowls.",
      "Ladle in the hot broth and top with cucumber and mint.",
      "Serve with chili paste on the side."
    ],
    substitutions: [
      "Shrimp → Chicken",
      "Fish balls → Tofu",
      "Coconut milk → Light coconut milk"
    ]
  },
  {
    name: "Char Kway Teow",
    category: "Malaysian",
    country: "Malaysia",
    continent: "Asia",
    meal: "Lunch",
    description:
      "Flat rice noodles stir-fried with soy, prawns, beansprouts, and savory aromatics.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "300 g flat rice noodles",
      "200 g prawns",
      "1 egg",
      "1 cup bean sprouts",
      "2 tbsp soy sauce",
      "1 tbsp sweet soy sauce",
      "2 garlic cloves, minced",
      "1 tbsp oil",
      "1 tbsp chili paste",
      "1 spring onion, sliced"
    ],
    instructions: [
      "Soak or cook the noodles until flexible.",
      "Stir-fry garlic and chili paste until aromatic.",
      "Add prawns and cook until just pink.",
      "Stir in noodles and both soy sauces.",
      "Push the mixture aside and scramble the egg in the wok.",
      "Toss with bean sprouts and green onion before serving."
    ],
    substitutions: [
      "Prawns → Chicken",
      "Soy sauce → Tamari",
      "Flat noodles → Rice vermicelli"
    ]
  },
  {
    name: "Hainanese Chicken Rice",
    category: "Singaporean",
    country: "Singapore",
    continent: "Asia",
    meal: "Dinner",
    description:
      "Tender poached chicken served with fragrant rice, chili sauce, and a simple ginger-soy dressing.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "1 whole chicken",
      "2 cups jasmine rice",
      "2 liters chicken stock",
      "1 tbsp ginger, sliced",
      "2 garlic cloves",
      "2 tbsp soy sauce",
      "1 tbsp sesame oil",
      "1 cucumber, sliced",
      "1 chili, chopped",
      "1 tsp salt"
    ],
    instructions: [
      "Poach the chicken in stock with ginger and garlic until cooked through.",
      "Cook the rice in the flavored stock for aromatic, savory results.",
      "Slice the chicken and arrange with cucumber.",
      "Prepare a dipping sauce with soy, chili, and sesame oil.",
      "Serve the rice and chicken with chili sauce on the side.",
      "Finish with a squeeze of lime and a few fresh herbs."
    ],
    substitutions: [
      "Chicken → Tofu",
      "Soy → Tamari",
      "Rice → Brown rice"
    ]
  },
  {
    name: "Chili Crab",
    category: "Singaporean",
    country: "Singapore",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A signature Singaporean crab dish in a rich, spicy tomato-and-chili sauce that is intensely savory and glossy.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 whole crabs",
      "2 tbsp garlic, minced",
      "1 onion, chopped",
      "2 tbsp chili sauce",
      "3 tbsp tomato paste",
      "1 tbsp soy sauce",
      "1 tbsp sugar",
      "1 tbsp lime juice",
      "1 tsp white pepper",
      "2 tbsp oil"
    ],
    instructions: [
      "Steam or boil the crabs until just cooked and crack the shell slightly.",
      "Sauté garlic and onion in oil until fragrant.",
      "Add chili sauce, tomato paste, soy sauce, sugar, and pepper.",
      "Stir in the crabs and toss until evenly coated.",
      "Simmer briefly until the sauce thickens and clings to the crab.",
      "Serve hot with bread or rice to soak up the sauce."
    ],
    substitutions: [
      "Crab → Prawns",
      "Tomato paste → Chili paste",
      "Bread → Rice"
    ]
  },
  {
    name: "Chicken Adobo",
    category: "Filipino",
    country: "Philippines",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A savory Filipino braise of chicken stewed in vinegar, soy, garlic, and pepper for a rich, balanced flavor.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g chicken thighs",
      "1/2 cup vinegar",
      "1/4 cup soy sauce",
      "5 garlic cloves",
      "1 tbsp black peppercorns",
      "2 bay leaves",
      "1 tbsp sugar",
      "2 tbsp oil",
      "1 cup water",
      "salt to taste"
    ],
    instructions: [
      "Combine vinegar, soy sauce, garlic, bay leaves, and pepper in a pot.",
      "Add chicken and simmer until the meat is nearly tender.",
      "Cook uncovered to reduce the sauce until glossy and flavorful.",
      "Add water and sugar if more liquid is needed.",
      "Allow the sauce to thicken lightly and coat the chicken.",
      "Serve hot with rice."
    ],
    substitutions: [
      "Chicken → Pork",
      "Vinegar → Coconut vinegar",
      "Soy → Tamari"
    ]
  },
  {
    name: "Sinigang",
    category: "Filipino",
    country: "Philippines",
    continent: "Asia",
    meal: "Soup",
    description:
      "A sour and savory Filipino soup with tamarind, vegetables, and a choice of pork, chicken, or seafood.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g pork belly",
      "1 cup tamarind paste",
      "1 onion, sliced",
      "2 tomatoes, chopped",
      "1 radish, sliced",
      "1 bunch kangkong",
      "1 long green chili",
      "1 tbsp fish sauce",
      "2 tbsp oil",
      "salt to taste"
    ],
    instructions: [
      "Boil the pork until tender and remove any excess fat.",
      "Add onion, tomatoes, and tamarind to the pot and simmer.",
      "Add radish and continue cooking until tender.",
      "Season with fish sauce and adjust the sourness.",
      "Add kangkong and chili just before serving.",
      "Enjoy hot with steamed rice."
    ],
    substitutions: [
      "Pork → Chicken",
      "Tamarind → Calamansi",
      "Kangkong → Spinach"
    ]
  },
  {
    name: "Pancit",
    category: "Filipino",
    country: "Philippines",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A beloved noodle dish of the Philippines, loaded with vegetables, chicken, and savory soy seasoning.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "300 g rice noodles",
      "200 g chicken, sliced",
      "1 carrot, julienned",
      "1 cup cabbage, shredded",
      "1/2 cup green beans",
      "2 tbsp soy sauce",
      "1 tbsp oyster sauce",
      "1 tbsp calamansi juice",
      "2 tbsp oil",
      "2 scallions, sliced"
    ],
    instructions: [
      "Cook the noodles according to package instructions and set aside.",
      "Stir-fry the chicken and vegetables until cooked but still crisp.",
      "Add the noodles and sauces, tossing until evenly coated.",
      "Season with calamansi juice and a little extra soy sauce if needed.",
      "Garnish with scallions and serve hot.",
      "Pair with chili oil for extra heat."
    ],
    substitutions: [
      "Chicken → Shrimp",
      "Rice noodles → Egg noodles",
      "Calamansi → Lime"
    ]
  },
  {
    name: "Lechon",
    category: "Filipino",
    country: "Philippines",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A celebratory roasted pig with crisp skin, tender meat, and rich, citrusy seasoning.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 8,
    ingredients: [
      "1 whole pig or pork shoulder",
      "1/2 cup soy sauce",
      "1/4 cup calamansi juice",
      "2 tbsp garlic, minced",
      "1 tbsp black pepper",
      "1 tbsp salt",
      "2 tbsp oil",
      "1 lemon",
      "1 onion, quartered",
      "1 bunch herbs"
    ],
    instructions: [
      "Season the pork generously with garlic, pepper, salt, and calamansi.",
      "Roast slowly until the skin crisps and the meat turns tender.",
      "Baste occasionally with the cooking juices to keep the surface glossy.",
      "Allow the meat to rest before carving.",
      "Slice into crisp, golden pieces and serve with herbs.",
      "Accompany with vinegar or chili dipping sauce."
    ],
    substitutions: [
      "Pork → Chicken",
      "Calamansi → Lime",
      "Roast → Grill"
    ]
  },
  {
    name: "Momos",
    category: "Nepalese",
    country: "Nepal",
    continent: "Asia",
    meal: "Snack",
    description:
      "Steamed dumplings filled with spiced vegetables or meat, served with a fiery dipping sauce.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "200 g flour",
      "150 g minced chicken",
      "1 onion, minced",
      "1 tsp ginger, grated",
      "1 tsp cumin",
      "1 tsp coriander",
      "1 tbsp oil",
      "1 tbsp soy sauce",
      "1 tsp chili sauce",
      "salt to taste"
    ],
    instructions: [
      "Prepare a soft dough and roll it into thin circles.",
      "Mix the filling with chicken, onion, herbs, and spice.",
      "Fill and fold the dumplings into pleated pockets.",
      "Steam until the dumplings are cooked and glossy.",
      "Serve hot with a chili-soy dipping sauce.",
      "Finish with a squeeze of lime and spring onion."
    ],
    substitutions: [
      "Chicken → Paneer",
      "Flour → Rice flour",
      "Soy sauce → Tamari"
    ]
  },
  {
    name: "Dal Bhat",
    category: "Nepalese",
    country: "Nepal",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A Nepalese comfort meal of lentils, rice, and vegetables, often served with pickles and greens.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "1 cup lentils",
      "2 cups rice",
      "1 onion, sliced",
      "2 garlic cloves, minced",
      "1 tomato, chopped",
      "1 tsp turmeric",
      "1 tbsp oil",
      "2 cups mixed greens",
      "1 tsp cumin",
      "salt to taste"
    ],
    instructions: [
      "Cook the rice until fluffy and tender.",
      "Simmer the lentils with turmeric and water until soft.",
      "Sauté onion, garlic, and tomato in oil with cumin.",
      "Combine the tempering with the lentils and season.",
      "Cook the greens briefly and serve alongside the rice.",
      "Finish with pickles and a spoon of ghee."
    ],
    substitutions: [
      "Lentils → Red lentils",
      "Rice → Quinoa",
      "Greens → Spinach"
    ]
  },
  {
    name: "Kottu Roti",
    category: "Sri Lankan",
    country: "Sri Lanka",
    continent: "Asia",
    meal: "Dinner",
    description:
      "A lively Sri Lankan chopped flatbread stir-fry packed with vegetables, eggs, and spiced meat.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "4 roti or flatbreads",
      "200 g chicken or beef",
      "2 eggs",
      "1 onion, chopped",
      "1 tomato, chopped",
      "1 bell pepper, chopped",
      "1 tbsp curry powder",
      "1 tbsp soy sauce",
      "2 tbsp oil",
      "2 tbsp cilantro"
    ],
    instructions: [
      "Chop the flatbread into small pieces and set aside.",
      "Sauté the protein with onion, tomato, and curry powder.",
      "Add the peppers and cook until tender.",
      "Scramble the eggs into the pan and add the flatbread pieces.",
      "Toss with soy sauce until everything is evenly mixed.",
      "Serve hot, garnished with cilantro."
    ],
    substitutions: [
      "Meat → Tofu",
      "Roti → Naan",
      "Curry powder → Garam masala"
    ]
  },
  {
    name: "Turkish Kebab",
    category: "Turkish",
    country: "Turkey",
    continent: "Asia",
    meal: "Dinner",
    description:
      "Juicy skewered meat with aromatic spices, grilled to smoky perfection and served with flatbread and herbs.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g lamb or chicken",
      "1 tbsp paprika",
      "1 tsp cumin",
      "1 tsp oregano",
      "2 garlic cloves, minced",
      "2 tbsp yogurt",
      "1 lemon",
      "1 onion, sliced",
      "1 tbsp oil",
      "flatbread for serving"
    ],
    instructions: [
      "Marinate the meat with yogurt, spices, garlic, and lemon juice.",
      "Thread onto skewers and grill or roast until evenly cooked.",
      "Char the edges slightly for a smoky finish.",
      "Serve with warm flatbread, onion, and herbs.",
      "Add a dollop of yogurt or tahini sauce if desired.",
      "Plate with grilled vegetables for balance."
    ],
    substitutions: [
      "Lamb → Chicken",
      "Yogurt → Tahini",
      "Flatbread → Rice"
    ]
  },
  {
    name: "Menemen",
    category: "Turkish",
    country: "Turkey",
    continent: "Asia",
    meal: "Breakfast",
    description:
      "A Turkish breakfast skillet of eggs, tomatoes, peppers, and herbs, gently cooked until silky.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 2,
    ingredients: [
      "3 eggs",
      "2 tomatoes, chopped",
      "1 green pepper, diced",
      "1 onion, sliced",
      "2 tbsp olive oil",
      "1 tsp paprika",
      "1 tsp chili flakes",
      "2 tbsp parsley",
      "salt to taste",
      "bread for serving"
    ],
    instructions: [
      "Sauté onion and peppers in olive oil until softened.",
      "Add tomatoes and paprika and cook until jammy.",
      "Crack in the eggs and stir gently until softly set.",
      "Season with chili and salt to taste.",
      "Fold in parsley and serve immediately.",
      "Enjoy with warm bread and olives."
    ],
    substitutions: [
      "Eggs → Tofu",
      "Bread → Toast",
      "Parsley → Dill"
    ]
  },
  {
    name: "Baklava",
    category: "Dessert",
    country: "Turkey",
    continent: "Asia",
    meal: "Dessert",
    description:
      "Layered filo pastry filled with nuts and honey, baked until crisp and delicately sweet.",
    image:
      "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=1200&q=80",
    servings: 12,
    ingredients: [
      "1 pack filo pastry",
      "200 g walnuts, chopped",
      "200 g pistachios, chopped",
      "1/2 cup melted butter",
      "1/2 cup sugar",
      "1 tsp cinnamon",
      "1 cup honey",
      "1/2 cup water",
      "1 tbsp lemon juice",
      "1 pinch salt"
    ],
    instructions: [
      "Mix the nuts, sugar, and cinnamon for the filling.",
      "Layer filo sheets with butter in a tray, alternating with the nut mix.",
      "Bake until deep golden and crisp.",
      "Heat honey, water, lemon juice, and salt to make the syrup.",
      "Pour the hot syrup over the hot baklava.",
      "Cool completely before slicing and serving."
    ],
    substitutions: [
      "Walnuts → Almonds",
      "Honey → Maple syrup",
      "Filo → Puff pastry"
    ]
  },
  {
    name: "Shakshuka",
    category: "Middle Eastern",
    country: "Israel",
    continent: "Middle East",
    meal: "Breakfast",
    description:
      "Soft eggs poached in a rich tomato, pepper, and spice sauce, a beloved North African and Middle Eastern skillet.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 2,
    ingredients: [
      "4 eggs",
      "2 tomatoes, chopped",
      "1 bell pepper, diced",
      "1 onion, sliced",
      "2 tbsp olive oil",
      "1 tsp cumin",
      "1 tsp paprika",
      "1/2 tsp turmeric",
      "1 tbsp parsley",
      "salt to taste"
    ],
    instructions: [
      "Sauté onion and pepper in olive oil until softened.",
      "Add tomatoes and spices and simmer until thick and saucy.",
      "Create small wells in the sauce and crack in the eggs.",
      "Cover briefly until the eggs are softly set.",
      "Season and finish with parsley.",
      "Serve warm with pita or crusty bread."
    ],
    substitutions: [
      "Eggs → Tofu",
      "Peppers → Zucchini",
      "Parsley → Cilantro"
    ]
  },
  {
    name: "Falafel",
    category: "Middle Eastern",
    country: "Israel",
    continent: "Middle East",
    meal: "Lunch",
    description:
      "Crisp chickpea fritters with herbs and spices, served with tahini, salad, and warm pita.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "400 g chickpeas, soaked",
      "1 onion, chopped",
      "2 garlic cloves",
      "1/2 cup parsley",
      "1 tsp cumin",
      "1 tsp coriander",
      "1/2 tsp baking soda",
      "2 tbsp flour",
      "oil for frying",
      "salt to taste"
    ],
    instructions: [
      "Process the chickpeas with onion, garlic, and herbs until coarse.",
      "Add spices, baking soda, and flour to bind the mixture.",
      "Shape into small patties and chill briefly.",
      "Fry in hot oil until deeply golden and crisp.",
      "Drain well and serve with tahini and salad.",
      "Wrap in pita with lettuce, tomato, and pickles."
    ],
    substitutions: [
      "Chickpeas → Fava beans",
      "Flour → Chickpea flour",
      "Tahini → Yogurt sauce"
    ]
  },
  {
    name: "Hummus",
    category: "Middle Eastern",
    country: "Lebanon",
    continent: "Middle East",
    meal: "Appetizer",
    description:
      "A creamy, earthy dip of chickpeas, tahini, lemon, and garlic, ideal for sharing with warm bread.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "400 g chickpeas",
      "2 tbsp tahini",
      "1 lemon, juiced",
      "2 garlic cloves",
      "2 tbsp olive oil",
      "1/4 cup water",
      "1/2 tsp cumin",
      "salt to taste",
      "1 tbsp parsley",
      "pita bread for serving"
    ],
    instructions: [
      "Blend the chickpeas, tahini, lemon juice, and garlic until smooth.",
      "Slowly add olive oil and water until the texture is creamy.",
      "Season with cumin and salt to taste.",
      "Adjust the texture with more water if needed.",
      "Top with olive oil and parsley.",
      "Serve with warm pita and vegetables."
    ],
    substitutions: [
      "Tahini → Greek yogurt",
      "Lemon → Lime",
      "Chickpeas → White beans"
    ]
  },
  {
    name: "Tabbouleh",
    category: "Middle Eastern",
    country: "Lebanon",
    continent: "Middle East",
    meal: "Salad",
    description:
      "A bright, herb-forward salad with parsley, bulgur, tomato, and lemon dressing.",
    image:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "1 cup bulgur",
      "2 cups parsley, finely chopped",
      "1 tomato, diced",
      "1 cucumber, diced",
      "2 tbsp mint, chopped",
      "2 tbsp lemon juice",
      "2 tbsp olive oil",
      "1/2 tsp salt",
      "1/4 tsp black pepper",
      "1 tbsp pomegranate seeds"
    ],
    instructions: [
      "Soak the bulgur in warm water until tender and drain well.",
      "Combine bulgur with parsley, tomato, cucumber, and mint.",
      "Whisk lemon juice, olive oil, salt, and pepper to make the dressing.",
      "Toss the salad with the dressing until evenly coated.",
      "Let the flavors rest briefly before serving.",
      "Finish with pomegranate seeds for a bright garnish."
    ],
    substitutions: [
      "Bulgur → Quinoa",
      "Parsley → Mint",
      "Pomegranate → Orange segments"
    ]
  },
  {
    name: "Fattoush",
    category: "Middle Eastern",
    country: "Lebanon",
    continent: "Middle East",
    meal: "Salad",
    description:
      "A lively salad of crisp greens, vegetables, herbs, and toasted pita with a lemony dressing.",
    image:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 pita breads, toasted",
      "1 cucumber, chopped",
      "2 tomatoes, chopped",
      "1 radish, sliced",
      "1 cup lettuce, torn",
      "1/2 cup parsley",
      "2 tbsp sumac",
      "2 tbsp lemon juice",
      "2 tbsp olive oil",
      "salt to taste"
    ],
    instructions: [
      "Chop the toasted pita into bite-size pieces.",
      "Toss the greens and vegetables in a large bowl.",
      "Whisk lemon juice, olive oil, sumac, and salt into a dressing.",
      "Add the pita pieces and dressing just before serving.",
      "Mix lightly to avoid sogginess.",
      "Serve chilled or at room temperature."
    ],
    substitutions: [
      "Pita → Crackers",
      "Sumac → Lemon zest",
      "Lettuce → Arugula"
    ]
  },
  {
    name: "Kibbeh",
    category: "Middle Eastern",
    country: "Lebanon",
    continent: "Middle East",
    meal: "Dinner",
    description:
      "A classic Lebanese dish of seasoned ground meat and bulgur, shaped and baked or fried with aromatic depth.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "250 g lamb or beef",
      "1 cup bulgur",
      "1 onion, grated",
      "1/2 tsp cinnamon",
      "1 tsp allspice",
      "1 tbsp pine nuts",
      "2 tbsp olive oil",
      "1 tsp salt",
      "1/2 tsp black pepper",
      "1/2 cup water"
    ],
    instructions: [
      "Soak the bulgur in water until soft and drain well.",
      "Mix with minced meat, onion, spices, and salt.",
      "Shape into patties or a loaf and bake or fry.",
      "Toast pine nuts in a little oil until fragrant.",
      "Serve with fresh herbs and a side salad.",
      "Pair with yogurt or tahini sauce for richness."
    ],
    substitutions: [
      "Lamb → Chicken",
      "Bulgur → Quinoa",
      "Pine nuts → Almonds"
    ]
  },
  {
    name: "Chicken Tagine",
    category: "North African",
    country: "Morocco",
    continent: "Africa",
    meal: "Dinner",
    description:
      "A slow-cooked Moroccan stew of chicken with spices, dried fruit, olives, and warming aromatic depth.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g chicken thighs",
      "1 onion, sliced",
      "2 tsp ras el hanout",
      "1 tsp cumin",
      "1/2 tsp cinnamon",
      "1 tbsp olive oil",
      "1/2 cup olives",
      "1/4 cup apricots",
      "1 cup stock",
      "2 tbsp parsley"
    ],
    instructions: [
      "Sear the chicken in olive oil until lightly browned.",
      "Add onion and spices, cooking until fragrant.",
      "Pour in stock and add apricots and olives.",
      "Cover and simmer gently until the chicken is tender.",
      "Adjust seasoning with salt and a squeeze of lemon.",
      "Serve with couscous and fresh herbs."
    ],
    substitutions: [
      "Chicken → Chickpeas",
      "Apricots → Prunes",
      "Olives → Capers"
    ]
  },
  {
    name: "Couscous",
    category: "North African",
    country: "Morocco",
    continent: "Africa",
    meal: "Dinner",
    description:
      "A fluffy Moroccan grain staple served with vegetables, herbs, and savory stew or grilled protein.",
    image:
      "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 cups couscous",
      "2 cups warm stock",
      "1 carrot, diced",
      "1 zucchini, diced",
      "1 onion, sliced",
      "2 tbsp olive oil",
      "1 tsp cumin",
      "1/2 tsp paprika",
      "1/4 cup parsley",
      "salt to taste"
    ],
    instructions: [
      "Steam the couscous with warm stock until fluffy.",
      "Sauté the vegetables with olive oil and spices.",
      "Fold the vegetables gently into the couscous.",
      "Fluff with a fork and let the grains breathe.",
      "Top with herbs and serve with a stew or grilled meat.",
      "Add a little lemon for freshness."
    ],
    substitutions: [
      "Couscous → Rice",
      "Vegetables → Chickpeas",
      "Parsley → Mint"
    ]
  },
  {
    name: "Harira",
    category: "North African",
    country: "Morocco",
    continent: "Africa",
    meal: "Soup",
    description:
      "A warming Moroccan soup rich with lentils, tomatoes, herbs, and traditional comfort flavors.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "200 g lamb or chickpeas",
      "1 cup lentils",
      "2 tomatoes, chopped",
      "1 onion, sliced",
      "1/2 cup celery, chopped",
      "1 tsp cumin",
      "1 tsp paprika",
      "1 tbsp tomato paste",
      "2 tbsp parsley",
      "1 liter stock"
    ],
    instructions: [
      "Build the base with onion, celery, tomatoes, and spices.",
      "Add the lentils and stock and simmer until tender.",
      "Stir in the protein and tomato paste.",
      "Cook until rich and flavorful.",
      "Finish with parsley and a squeeze of lemon.",
      "Serve hot with dates or bread."
    ],
    substitutions: [
      "Lamb → Chickpeas",
      "Tomato paste → Roasted red pepper",
      "Parsley → Coriander"
    ]
  },
  {
    name: "Doro Wat",
    category: "African",
    country: "Ethiopia",
    continent: "Africa",
    meal: "Dinner",
    description:
      "A rich Ethiopian chicken stew simmered with berbere spice, onions, and a deeply aromatic base.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g chicken",
      "2 onions, chopped",
      "2 tbsp berbere spice",
      "1 tbsp garlic, minced",
      "1 tbsp ginger, minced",
      "1 tbsp butter",
      "1 cup stock",
      "2 boiled eggs",
      "1 tbsp lemon juice",
      "salt to taste"
    ],
    instructions: [
      "Cook the onions until soft and jammy in butter.",
      "Add garlic, ginger, and berbere and cook briefly.",
      "Add the chicken and stock, then simmer until tender.",
      "Stir in the eggs and finish with lemon juice.",
      "The sauce should be thick and glossy.",
      "Serve with injera or flatbread."
    ],
    substitutions: [
      "Chicken → Chickpeas",
      "Berbere → Chili powder",
      "Eggs → Tofu"
    ]
  },
  {
    name: "Jollof Rice",
    category: "West African",
    country: "Nigeria",
    continent: "Africa",
    meal: "Dinner",
    description:
      "A vibrant party rice dish from West Africa, rich with tomato, peppers, spices, and aromatic stock.",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 cups rice",
      "1 onion, chopped",
      "2 tomatoes, blended",
      "1 red bell pepper",
      "2 tbsp tomato paste",
      "1 tsp curry powder",
      "1 tsp thyme",
      "2 tbsp oil",
      "500 ml stock",
      "salt to taste"
    ],
    instructions: [
      "Sauté onion and red pepper in oil until soft and fragrant.",
      "Add tomato paste, tomatoes, and spices, then simmer to a thick sauce.",
      "Add the rice and stir to coat it evenly.",
      "Pour in the stock and cook on low heat until tender.",
      "Let the rice steam briefly before fluffing.",
      "Serve with fried plantain or grilled chicken."
    ],
    substitutions: [
      "Rice → Brown rice",
      "Tomato → Pumpkin",
      "Stock → Vegetable stock"
    ]
  },
  {
    name: "Suya",
    category: "West African",
    country: "Nigeria",
    continent: "Africa",
    meal: "Dinner",
    description:
      "Spiced grilled meat skewers tossed with ground peanuts and a fiery, aromatic blend of West African seasonings.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g beef strips",
      "1 tbsp ground peanuts",
      "1 tsp paprika",
      "1 tsp cumin",
      "1 tsp ginger powder",
      "1 tsp garlic powder",
      "1 tbsp oil",
      "1 tbsp chili flakes",
      "1 onion, sliced",
      "salt to taste"
    ],
    instructions: [
      "Marinate the beef with oil, spices, and seasoning.",
      "Thread onto skewers and grill until charred and cooked.",
      "Add the peanuts and a little extra spice during the final minutes.",
      "Cook until fragrant and lightly smoky.",
      "Serve with sliced onion and pepper relish.",
      "Pair with yams or rice."
    ],
    substitutions: [
      "Beef → Chicken",
      "Peanuts → Sesame",
      "Skewers → Grilled slices"
    ]
  },
  {
    name: "Egusi Soup",
    category: "West African",
    country: "Nigeria",
    continent: "Africa",
    meal: "Soup",
    description:
      "A rich and savory Nigerian soup with melon seed paste, greens, and comforting, earthy depth.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "1 cup ground egusi seeds",
      "500 g beef or chicken",
      "1 onion, chopped",
      "2 tomatoes, chopped",
      "1 bunch spinach",
      "1 tbsp palm oil",
      "1 tsp crayfish",
      "1 tsp seasoning cube",
      "1 liter stock",
      "salt to taste"
    ],
    instructions: [
      "Sauté onion and tomatoes with palm oil until fragrant.",
      "Add the meat and stock, then simmer until tender.",
      "Whisk the egusi into a paste with a bit of water.",
      "Pour the paste into the pot and stir continuously.",
      "Add spinach and crayfish and simmer gently.",
      "Serve with fufu or rice."
    ],
    substitutions: [
      "Egusi → Ground pumpkin seeds",
      "Spinach → Kale",
      "Palm oil → Olive oil"
    ]
  },
  {
    name: "Bobotie",
    category: "South African",
    country: "South Africa",
    continent: "Africa",
    meal: "Dinner",
    description:
      "A fragrant Cape Malay baked dish of spiced mince topped with savory custard and toasted almonds.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g minced beef",
      "1 onion, chopped",
      "1 tbsp curry powder",
      "1 tbsp apricot jam",
      "1/2 cup breadcrumbs",
      "1 egg",
      "1 cup milk",
      "2 tbsp almonds",
      "1 tbsp oil",
      "salt to taste"
    ],
    instructions: [
      "Brown the mince with onion and curry powder.",
      "Mix in breadcrumbs, jam, and seasoning, then bake in a dish.",
      "Whisk egg and milk to make the topping.",
      "Pour over the mince and sprinkle with almonds.",
      "Bake until set and golden.",
      "Serve with rice and chutney."
    ],
    substitutions: [
      "Beef → Chicken",
      "Almonds → Cashews",
      "Jam → Apricot preserve"
    ]
  },
  {
    name: "Bunny Chow",
    category: "South African",
    country: "South Africa",
    continent: "Africa",
    meal: "Lunch",
    description:
      "A hearty South African curry served in a hollow loaf of bread, built for bold, filling comfort.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g lamb or chicken",
      "1 loaf bread",
      "1 onion, chopped",
      "2 tbsp curry powder",
      "2 tomatoes, chopped",
      "1 potato, cubed",
      "1 cup stock",
      "2 tbsp oil",
      "1 tbsp cilantro",
      "salt to taste"
    ],
    instructions: [
      "Brown the meat and onions in oil with curry powder.",
      "Add tomatoes and potatoes, then pour in the stock.",
      "Simmer until the meat is tender and the sauce thickens.",
      "Remove the bread center and fill the loaf with the curry.",
      "Top with cilantro and serve immediately.",
      "Enjoy as a street-food style meal."
    ],
    substitutions: [
      "Lamb → Beef",
      "Bread → Pita",
      "Potato → Sweet potato"
    ]
  },
  {
    name: "Classic Cheeseburger",
    category: "American",
    country: "United States",
    continent: "North America",
    meal: "Dinner",
    description:
      "A juicy grilled beef burger layered with cheese, pickles, lettuce, and tomato on a toasted bun.",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g ground beef",
      "4 burger buns",
      "4 slices cheddar",
      "1 tomato, sliced",
      "1 lettuce leaf",
      "1 onion, sliced",
      "1 tbsp pickles",
      "2 tbsp mayonnaise",
      "1 tbsp mustard",
      "salt and pepper"
    ],
    instructions: [
      "Form the ground beef into patties and season generously.",
      "Grill or sear the patties until cooked to the desired doneness.",
      "Add cheese on top and let it melt slightly.",
      "Toast the buns lightly.",
      "Layer with lettuce, tomato, onion, pickles, and sauces.",
      "Assemble and serve immediately with fries."
    ],
    substitutions: [
      "Beef → Turkey patty",
      "Cheddar → Swiss",
      "Bun → Brioche bun"
    ]
  },
  {
    name: "New York Cheesecake",
    category: "American",
    country: "United States",
    continent: "North America",
    meal: "Dessert",
    description:
      "A dense, creamy classic cheesecake with a buttery crust and a delicate vanilla finish.",
    image:
      "https://images.unsplash.com/photo-1533134242443-d6ddb287dce4?auto=format&fit=crop&w=1200&q=80",
    servings: 8,
    ingredients: [
      "200 g graham crackers",
      "400 g cream cheese",
      "200 g sugar",
      "3 eggs",
      "1 tsp vanilla",
      "1/2 cup sour cream",
      "1/4 cup butter",
      "1 tbsp flour",
      "1 pinch salt",
      "1 tbsp lemon juice"
    ],
    instructions: [
      "Crush the crackers and mix with melted butter to form the crust.",
      "Press into a springform pan and chill.",
      "Beat the cream cheese, sugar, and vanilla until smooth.",
      "Add eggs one at a time and fold in the sour cream and flour.",
      "Bake until just set and then cool completely.",
      "Serve chilled with berries or caramel."
    ],
    substitutions: [
      "Cream cheese → Mascarpone",
      "Graham crackers → Oreo crumbs",
      "Lemon juice → Vanilla"
    ]
  },
  {
    name: "Pancakes",
    category: "American",
    country: "United States",
    continent: "North America",
    meal: "Breakfast",
    description:
      "Fluffy golden pancakes with a soft interior and a lightly crisp edge, perfect with syrup and fruit.",
    image:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "1 1/2 cups flour",
      "2 tbsp sugar",
      "2 tsp baking powder",
      "1/2 tsp salt",
      "1 egg",
      "1 1/4 cups milk",
      "2 tbsp melted butter",
      "1 tsp vanilla",
      "1 tsp cinnamon",
      "maple syrup"
    ],
    instructions: [
      "Whisk together the dry ingredients in a bowl.",
      "Mix the egg, milk, butter, and vanilla in another bowl.",
      "Combine the wet and dry ingredients until just mixed.",
      "Cook small rounds on a lightly greased griddle.",
      "Flip once bubbles appear on top.",
      "Serve with maple syrup, berries, or banana slices."
    ],
    substitutions: [
      "Flour → Oat flour",
      "Milk → Almond milk",
      "Butter → Coconut oil"
    ]
  },
  {
    name: "Mac and Cheese",
    category: "American",
    country: "United States",
    continent: "North America",
    meal: "Dinner",
    description:
      "Creamy baked macaroni enriched with a sharp cheddar sauce and buttery top.",
    image:
      "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "250 g macaroni",
      "2 tbsp butter",
      "2 tbsp flour",
      "2 cups milk",
      "2 cups cheddar cheese",
      "1/2 tsp garlic powder",
      "1/2 tsp mustard powder",
      "1 pinch paprika",
      "1/4 cup breadcrumbs",
      "salt to taste"
    ],
    instructions: [
      "Cook the macaroni until tender and drain.",
      "Melt butter, add flour, and cook briefly to form a roux.",
      "Whisk in milk until smooth and thickened.",
      "Stir in cheddar and seasonings until glossy.",
      "Combine with pasta and top with breadcrumbs.",
      "Bake until golden and bubbling."
    ],
    substitutions: [
      "Cheddar → Gruyère",
      "Milk → Oat milk",
      "Breadcrumbs → Crushed crackers"
    ]
  },
  {
    name: "BBQ Ribs",
    category: "American",
    country: "United States",
    continent: "North America",
    meal: "Dinner",
    description:
      "Slow-cooked pork ribs glazed with smoky barbecue sauce and caramelized to a rich finish.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "1 kg pork ribs",
      "1/2 cup tomato sauce",
      "2 tbsp brown sugar",
      "1 tbsp paprika",
      "1 tbsp mustard",
      "2 tbsp vinegar",
      "1 tbsp Worcestershire sauce",
      "1 tsp garlic powder",
      "1 tsp onion powder",
      "salt to taste"
    ],
    instructions: [
      "Season the ribs with paprika, garlic, onion, and salt.",
      "Cook low and slow until tender and moisture-rich.",
      "Prepare the barbecue glaze with tomato sauce, sugar, vinegar, and spices.",
      "Brush the glaze over the ribs during the final cooking stage.",
      "Finish until sticky and caramelized.",
      "Serve with slaw and cornbread."
    ],
    substitutions: [
      "Pork → Chicken",
      "Tomato sauce → Peach glaze",
      "Brown sugar → Honey"
    ]
  },
  {
    name: "Buffalo Wings",
    category: "American",
    country: "United States",
    continent: "North America",
    meal: "Appetizer",
    description:
      "Crispy chicken wings tossed in a hot buttery sauce and served with cooling ranch or blue cheese.",
    image:
      "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g chicken wings",
      "1 cup flour",
      "1/2 tsp paprika",
      "1/2 tsp garlic powder",
      "2 tbsp butter",
      "2 tbsp hot sauce",
      "1 tbsp vinegar",
      "1 tsp honey",
      "1 celery stalk",
      "ranch dressing"
    ],
    instructions: [
      "Coat the wings in flour and seasonings and fry until crisp.",
      "Warm the butter, hot sauce, vinegar, and honey into a glossy marinade.",
      "Toss the wings in the sauce until fully coated.",
      "Serve hot with celery and ranch.",
      "Adjust spice level to taste.",
      "Enjoy with fries or slaw."
    ],
    substitutions: [
      "Chicken → Cauliflower bites",
      "Hot sauce → Chili crisp",
      "Ranch → Yogurt dip"
    ]
  },
  {
    name: "Tacos",
    category: "Mexican",
    country: "Mexico",
    continent: "North America",
    meal: "Dinner",
    description:
      "A vibrant Mexican street-food favorite with seasoned meat, crisp toppings, and warm tortillas.",
    image:
      "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "8 small tortillas",
      "500 g chicken or beef",
      "1 tsp chili powder",
      "1 tsp cumin",
      "1/2 tsp paprika",
      "1 onion, diced",
      "1 cup lettuce, shredded",
      "1 tomato, diced",
      "1 avocado, sliced",
      "1/4 cup salsa"
    ],
    instructions: [
      "Season the meat with chili powder, cumin, and paprika.",
      "Cook until browned and fully done.",
      "Warm the tortillas in a dry skillet.",
      "Fill each tortilla with the protein and toppings.",
      "Finish with salsa and lime.",
      "Serve immediately with sour cream or guacamole."
    ],
    substitutions: [
      "Meat → Black beans",
      "Corn tortillas → Flour tortillas",
      "Salsa → Pico de gallo"
    ]
  },
  {
    name: "Enchiladas",
    category: "Mexican",
    country: "Mexico",
    continent: "North America",
    meal: "Dinner",
    description:
      "Rolled tortillas filled with savory filling, smothered in enchilada sauce, and baked until bubbling.",
    image:
      "https://images.unsplash.com/photo-1586511934875-5c5411eebf79?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "8 tortillas",
      "300 g chicken",
      "1 cup enchilada sauce",
      "1 cup cheese",
      "1 onion, diced",
      "1/2 cup sour cream",
      "1 tbsp cumin",
      "1 tsp chili powder",
      "1 tbsp oil",
      "1 tbsp cilantro"
    ],
    instructions: [
      "Cook the chicken with onion, cumin, and chili powder.",
      "Fill each tortilla with the mixture and roll tightly.",
      "Place the enchiladas in a baking dish and cover with sauce.",
      "Bake until the sauce is bubbling and the cheese melts.",
      "Finish with sour cream and cilantro.",
      "Serve with rice and beans."
    ],
    substitutions: [
      "Chicken → Beans",
      "Cheese → Vegan cheese",
      "Sour cream → Greek yogurt"
    ]
  },
  {
    name: "Quesadillas",
    category: "Mexican",
    country: "Mexico",
    continent: "North America",
    meal: "Lunch",
    description:
      "Crisp grilled tortillas stuffed with melted cheese and savory fillings for a quick, satisfying favorite.",
    image:
      "https://images.unsplash.com/photo-1613514785940-daed07799d9b?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "8 tortillas",
      "2 cups cheese, shredded",
      "1 cup cooked chicken",
      "1 cup black beans",
      "1/2 onion, diced",
      "1 tsp cumin",
      "1 tbsp oil",
      "1/2 cup salsa",
      "1 avocado",
      "1 tbsp lime juice"
    ],
    instructions: [
      "Sauté the onion and chicken with cumin until fragrant.",
      "Lay the tortillas flat and sprinkle with cheese and filling.",
      "Fold over and cook in a skillet until crisp.",
      "Flip once to brown both sides evenly.",
      "Serve with salsa, avocado, and lime.",
      "Slice into wedges and enjoy hot."
    ],
    substitutions: [
      "Chicken → Mushrooms",
      "Cheese → Dairy-free cheese",
      "Avocado → Guacamole"
    ]
  },
  {
    name: "Guacamole",
    category: "Mexican",
    country: "Mexico",
    continent: "North America",
    meal: "Appetizer",
    description:
      "A creamy avocado dip with lime, onion, chili, and cilantro, bright and fresh with every bite.",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "3 avocados",
      "1 tomato, diced",
      "1/2 onion, finely chopped",
      "1 lime, juiced",
      "1 jalapeño, minced",
      "2 tbsp cilantro",
      "1/2 tsp cumin",
      "salt to taste",
      "1 tbsp olive oil",
      "crackers or chips"
    ],
    instructions: [
      "Mash the avocados in a bowl until creamy but chunky.",
      "Fold in onion, tomato, lime juice, and jalapeño.",
      "Season with cumin, cilantro, and salt.",
      "Mix gently to keep the texture fresh.",
      "Adjust the seasoning and add more lime if needed.",
      "Serve with tortilla chips or alongside tacos."
    ],
    substitutions: [
      "Avocado → Hummus",
      "Jalapeño → Bell pepper",
      "Chips → Crudités"
    ]
  },
  {
    name: "Pozole",
    category: "Mexican",
    country: "Mexico",
    continent: "North America",
    meal: "Soup",
    description:
      "A comforting hominy soup with tender pork, bold broth, and toppings served family-style.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g pork shoulder",
      "2 cups hominy",
      "1 onion, chopped",
      "2 garlic cloves",
      "1 tbsp cumin",
      "1 tbsp oregano",
      "1 tbsp chili powder",
      "2 liters stock",
      "1 lime",
      "1 cup cabbage, shredded"
    ],
    instructions: [
      "Simmer pork with onion, garlic, and stock until tender.",
      "Add hominy and seasonings and cook until rich and flavorful.",
      "Stir in oregano and chili powder for depth.",
      "Adjust salt and chili heat to taste.",
      "Serve with cabbage, lime, and radish.",
      "Top with fresh cilantro and tortilla strips."
    ],
    substitutions: [
      "Pork → Chicken",
      "Hominy → White beans",
      "Cabbage → Lettuce"
    ]
  },
  {
    name: "Poutine",
    category: "Canadian",
    country: "Canada",
    continent: "North America",
    meal: "Snack",
    description:
      "A Canadian comfort classic of crispy fries topped with cheese curds and rich gravy.",
    image:
      "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g potatoes",
      "200 g cheese curds",
      "1 cup beef gravy",
      "1 tbsp oil",
      "1 tbsp butter",
      "salt to taste",
      "1 tsp pepper",
      "1 tsp paprika",
      "1 tbsp chives",
      "1 tbsp parsley"
    ],
    instructions: [
      "Cut the potatoes into thick fries and fry until crisp.",
      "Warm the gravy and keep it hot.",
      "Arrange the fries in a tray and top with cheese curds.",
      "Pour the hot gravy over the top.",
      "Finish with paprika, chives, and parsley.",
      "Serve immediately while hot and gooey."
    ],
    substitutions: [
      "Cheese curds → Mozzarella",
      "Beef gravy → Mushroom gravy",
      "Potatoes → Sweet potato fries"
    ]
  },
  {
    name: "Spaghetti Carbonara",
    category: "Italian",
    country: "Italy",
    continent: "Europe",
    meal: "Dinner",
    description:
      "A Roman pasta classic with silky egg and pecorino sauce, crisp pancetta, and freshly cracked black pepper.",
    image:
      "https://images.unsplash.com/photo-1608897013039-887f21d8c804?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "400 g spaghetti",
      "150 g pancetta, diced",
      "3 large eggs",
      "80 g Pecorino Romano, finely grated",
      "1 tsp black pepper",
      "salt to taste"
    ],
    instructions: [
      "Boil the spaghetti in salted water until al dente, reserving a cup of pasta water.",
      "Brown the pancetta in a skillet until crisp.",
      "Whisk the eggs, grated Pecorino, and black pepper in a bowl.",
      "Toss the drained pasta with pancetta off the heat.",
      "Stir in the egg mixture with a splash of pasta water until glossy.",
      "Serve immediately with extra Pecorino and pepper."
    ],
    substitutions: [
      "Pancetta → Guanciale",
      "Pecorino Romano → Parmesan",
      "Spaghetti → Bucatini"
    ]
  },
  {
    name: "Classic Lasagna",
    category: "Italian",
    country: "Italy",
    continent: "Europe",
    meal: "Dinner",
    description:
      "Layers of pasta, slow-simmered beef ragù, creamy béchamel, and golden cheese baked until bubbling.",
    image:
      "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=1200&q=80",
    servings: 8,
    ingredients: [
      "12 lasagna sheets",
      "500 g ground beef",
      "1 onion, finely chopped",
      "700 g crushed tomatoes",
      "2 cups béchamel sauce",
      "200 g mozzarella, grated",
      "60 g Parmesan, grated",
      "2 tbsp olive oil",
      "salt and black pepper"
    ],
    instructions: [
      "Sauté the onion in olive oil, add beef, and cook until browned.",
      "Add crushed tomatoes, season, and simmer the ragù for 25 minutes.",
      "Spread a little ragù in a baking dish and add a layer of pasta sheets.",
      "Layer ragù, béchamel, and cheese, repeating until the dish is filled.",
      "Bake at 190°C until golden and bubbling, about 35 minutes.",
      "Rest for 10 minutes before slicing and serving."
    ],
    substitutions: [
      "Ground beef → Lentils",
      "Mozzarella → Provolone",
      "Lasagna sheets → Fresh pasta sheets"
    ]
  },
  {
    name: "Pesto Pasta",
    category: "Italian",
    country: "Italy",
    continent: "Europe",
    meal: "Lunch",
    description:
      "A bright Ligurian pasta tossed with fresh basil pesto, Parmesan, pine nuts, and a little pasta water.",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "400 g trofie or linguine",
      "2 cups fresh basil leaves",
      "50 g pine nuts",
      "60 g Parmesan, grated",
      "1 garlic clove",
      "100 ml extra-virgin olive oil",
      "salt to taste"
    ],
    instructions: [
      "Blend basil, pine nuts, garlic, and Parmesan until finely chopped.",
      "Drizzle in olive oil while blending to make a coarse pesto.",
      "Boil pasta in salted water until al dente and reserve some pasta water.",
      "Toss pasta with pesto and enough pasta water to coat evenly.",
      "Finish with Parmesan and serve warm."
    ],
    substitutions: [
      "Pine nuts → Walnuts",
      "Parmesan → Pecorino",
      "Trofie → Fusilli"
    ]
  },
  {
    name: "Feijoada",
    category: "Brazilian",
    country: "Brazil",
    continent: "South America",
    meal: "Dinner",
    description:
      "A hearty Brazilian black bean stew with pork, sausage, and warm, smoky seasoning.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "300 g black beans",
      "200 g pork shoulder",
      "200 g smoked sausage",
      "1 onion, chopped",
      "2 garlic cloves",
      "1 tomato, chopped",
      "1 bay leaf",
      "1 tbsp olive oil",
      "1 tsp paprika",
      "salt to taste"
    ],
    instructions: [
      "Cook the beans until tender and drain, reserving some broth.",
      "Brown the pork and sausage in a pot with oil.",
      "Add onion, garlic, tomato, bay leaf, and paprika.",
      "Combine with the beans and enough cooking liquid to create a rich stew.",
      "Simmer until thick and comforting.",
      "Serve with rice, orange slices, and greens."
    ],
    substitutions: [
      "Pork → Turkey",
      "Beans → Kidney beans",
      "Sausage → Vegetarian sausage"
    ]
  },
  {
    name: "Coxinha",
    category: "Brazilian",
    country: "Brazil",
    continent: "South America",
    meal: "Appetizer",
    description:
      "A Brazilian snack shaped like a teardrop with a creamy chicken filling and golden fried crust.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "300 g cooked chicken, shredded",
      "2 cups flour",
      "1/2 cup milk",
      "1 tbsp butter",
      "1 onion, finely chopped",
      "1 tbsp parsley",
      "1 egg",
      "oil for frying",
      "salt to taste",
      "1 pinch nutmeg"
    ],
    instructions: [
      "Cook the chicken and seasonings until combined and creamy.",
      "Prepare a soft dough with flour, milk, butter, and salt.",
      "Shape the dough around the chicken filling into teardrops.",
      "Dip in egg and fry until deeply golden.",
      "Drain and serve hot.",
      "Pair with spicy salsa or aioli."
    ],
    substitutions: [
      "Chicken → Cheese",
      "Milk → Plant milk",
      "Frying → Baking"
    ]
  },
  {
    name: "Pão de Queijo",
    category: "Brazilian",
    country: "Brazil",
    continent: "South America",
    meal: "Breakfast",
    description:
      "Chewy Brazilian cheese breads made with cassava flour and a genuinely savory cheese flavor.",
    image:
      "https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 cups cassava flour",
      "1 cup milk",
      "1 egg",
      "1/2 cup parmesan",
      "1 tbsp butter",
      "1/2 tsp salt",
      "1/4 tsp baking powder",
      "1 tbsp olive oil",
      "1/2 cup mozzarella",
      "1 tsp pepper"
    ],
    instructions: [
      "Warm the milk and butter with salt until just steaming.",
      "Add the cassava flour and mix until smooth.",
      "Stir in the egg, cheese, and baking powder.",
      "Shape small rounds and place onto a tray.",
      "Bake until puffed and lightly golden.",
      "Serve warm and fresh."
    ],
    substitutions: [
      "Parmesan → Feta",
      "Cassava flour → Tapioca starch",
      "Mozzarella → Cheddar"
    ]
  },
  {
    name: "Empanadas",
    category: "Latin American",
    country: "Argentina",
    continent: "South America",
    meal: "Appetizer",
    description:
      "Savory pastry pockets filled with spiced meat, cheese, or vegetables and baked to perfection.",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "8 pastry discs",
      "300 g beef mince",
      "1 onion, diced",
      "1 tsp paprika",
      "1/2 tsp cumin",
      "1 tsp oregano",
      "1 egg",
      "1 tbsp olive oil",
      "1/4 cup olives",
      "salt to taste"
    ],
    instructions: [
      "Cook the beef with onion and spices until the filling is fragrant and thick.",
      "Cool slightly before filling the pastry discs.",
      "Fold and seal the edges firmly.",
      "Brush with beaten egg and bake until golden.",
      "Serve with chimichurri or salsa.",
      "Enjoy warm or at room temperature."
    ],
    substitutions: [
      "Beef → Chicken",
      "Pastry → Puff pastry",
      "Olives → Corn"
    ]
  },
  {
    name: "Asado",
    category: "Argentine",
    country: "Argentina",
    continent: "South America",
    meal: "Dinner",
    description:
      "A traditional Argentine barbecue featuring grilled meats, smoky char, and a social, celebratory table style.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "800 g beef ribs or flank",
      "1 tbsp paprika",
      "1 tbsp oregano",
      "2 garlic cloves, minced",
      "2 tbsp olive oil",
      "1 tbsp salt",
      "1 tsp black pepper",
      "1 lemon",
      "2 peppers, halved",
      "1 onion, sliced"
    ],
    instructions: [
      "Season the meat generously with garlic, oil, paprika, oregano, salt, and pepper.",
      "Let it rest before grilling.",
      "Cook over direct heat until browned with a smoky char.",
      "Turn occasionally and allow the meat to cook through slowly.",
      "Serve with grilled vegetables and lemon.",
      "Pair with chimichurri for extra flavor."
    ],
    substitutions: [
      "Beef → Chicken",
      "Lemon → Vinegar",
      "Peppers → Zucchini"
    ]
  },
  {
    name: "Chimichurri",
    category: "Argentine",
    country: "Argentina",
    continent: "South America",
    meal: "Sauce",
    description:
      "A bright green herb sauce of parsley, garlic, vinegar, and olive oil for grilled meats and vegetables.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "1 cup parsley",
      "3 garlic cloves",
      "2 tbsp oregano",
      "1/4 cup red wine vinegar",
      "1/3 cup olive oil",
      "1 tsp chili flakes",
      "1/2 tsp salt",
      "1/4 tsp black pepper",
      "1 tbsp lemon juice",
      "1 tbsp water"
    ],
    instructions: [
      "Blend the herbs, garlic, and oregano until finely chopped.",
      "Add vinegar, olive oil, chili, salt, and pepper.",
      "Whisk until emulsified and glossy.",
      "Adjust the thickness with a little water or more oil.",
      "Let the sauce rest for 10 minutes before serving.",
      "Use over grilled meats, steak, or vegetables."
    ],
    substitutions: [
      "Parsley → Cilantro",
      "Red wine vinegar → Apple cider vinegar",
      "Chili flakes → Paprika"
    ]
  },
  {
    name: "Ceviche",
    category: "Peruvian",
    country: "Peru",
    continent: "South America",
    meal: "Appetizer",
    description:
      "Fresh raw fish cured in citrus juice and combined with onion, chili, and herbs for a vibrant bite.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "300 g white fish",
      "1/2 cup lime juice",
      "1/2 cup orange juice",
      "1 red onion, sliced",
      "1 chili, sliced",
      "1 cucumber, diced",
      "2 tbsp cilantro",
      "1 tbsp olive oil",
      "1/2 tsp salt",
      "1 avocado, sliced"
    ],
    instructions: [
      "Cut the fish into small, even pieces and place in a bowl.",
      "Cover with lime and orange juice and chill until cured.",
      "Add onion, chili, cucumber, and cilantro.",
      "Season with salt and olive oil.",
      "Let the flavors meld briefly before serving.",
      "Top with avocado and serve with plantain chips."
    ],
    substitutions: [
      "Fish → Shrimp",
      "Orange juice → Grapefruit",
      "Avocado → Mango"
    ]
  },
  {
    name: "Lomo Saltado",
    category: "Peruvian",
    country: "Peru",
    continent: "South America",
    meal: "Dinner",
    description:
      "A savory Peruvian stir-fry of beef, tomatoes, onions, and fries, blended with bold seasoning.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g sirloin",
      "2 potatoes, sliced and fried",
      "1 onion, sliced",
      "2 tomatoes, wedged",
      "2 tbsp soy sauce",
      "1 tbsp vinegar",
      "1 tsp cumin",
      "1 tbsp oil",
      "1 tsp paprika",
      "1 chili, sliced"
    ],
    instructions: [
      "Sear the beef strips until lightly browned.",
      "Add onion and tomatoes and toss until aromatic.",
      "Stir in soy sauce, vinegar, cumin, paprika, and chili.",
      "Add the fries and fold together gently.",
      "Cook until the sauce lightly reduces and everything is coated.",
      "Serve with rice and a squeeze of lime."
    ],
    substitutions: [
      "Beef → Chicken",
      "Fries → Rice",
      "Vinegar → Lime juice"
    ]
  },
  {
    name: "Arepas",
    category: "Colombian",
    country: "Colombia",
    continent: "South America",
    meal: "Breakfast",
    description:
      "Golden corn cakes from Colombia and Venezuela, often served with cheese, avocado, or savory toppings.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 cups pre-cooked corn flour",
      "1 1/2 cups warm water",
      "1/2 tsp salt",
      "1 tbsp butter",
      "1 cup cheese, shredded",
      "1 avocado, sliced",
      "1 tbsp olive oil",
      "1/2 tsp cumin",
      "1/2 tsp paprika",
      "1 tbsp cilantro"
    ],
    instructions: [
      "Mix the corn flour, water, salt, and butter into a soft dough.",
      "Shape into round discs and flatten gently.",
      "Cook on a skillet until browned on both sides.",
      "Fill with cheese or serve with avocado and salsa.",
      "Let them rest briefly before serving.",
      "Serve warm and crisp."
    ],
    substitutions: [
      "Cheese → Beans",
      "Corn flour → Masa harina",
      "Avocado → Guacamole"
    ]
  },
  {
    name: "Bandeja Paisa",
    category: "Colombian",
    country: "Colombia",
    continent: "South America",
    meal: "Dinner",
    description:
      "A hearty Colombian platter featuring rice, beans, grilled meat, fried plantain, and egg.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "400 g beef steak",
      "2 cups rice",
      "1 cup beans",
      "2 eggs",
      "2 plantains",
      "1 avocado",
      "1 tbsp oil",
      "1 tbsp garlic",
      "1 tsp cumin",
      "salt to taste"
    ],
    instructions: [
      "Cook the rice and beans separately until tender.",
      "Grill or sear the beef until cooked.",
      "Fry the plantains and eggs until golden.",
      "Arrange the platter with all components.",
      "Add avocado and garnish with herbs.",
      "Serve family-style and enjoy the generous portion."
    ],
    substitutions: [
      "Beef → Chicken",
      "Plantains → Sweet potatoes",
      "Beans → Lentils"
    ]
  },
  {
    name: "Ajiaco",
    category: "Colombian",
    country: "Colombia",
    continent: "South America",
    meal: "Soup",
    description:
      "A comforting Colombian chicken soup with corn, potatoes, and a rich mountain flavor profile.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g chicken",
      "2 potatoes, cubed",
      "1 cup corn",
      "1 onion, chopped",
      "2 garlic cloves",
      "1 tsp cumin",
      "1 tbsp oil",
      "1 bunch cilantro",
      "1 avocado",
      "salt to taste"
    ],
    instructions: [
      "Boil the chicken with onion and garlic until tender.",
      "Add the potatoes and corn and cook until soft.",
      "Stir in cumin and season with salt.",
      "Serve in a deep bowl with cilantro and avocado.",
      "Let the broth absorb the richness of the stock.",
      "Enjoy with capers or crusty bread."
    ],
    substitutions: [
      "Chicken → Turkey",
      "Corn → Hominy",
      "Avocado → Plantain"
    ]
  },
  {
    name: "Pastel de Choclo",
    category: "Chilean",
    country: "Chile",
    continent: "South America",
    meal: "Dinner",
    description:
      "A savory Chilean pie with a sweet corn topping over a richly seasoned ground beef filling.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g beef mince",
      "3 cups corn kernels",
      "1 onion, chopped",
      "1 tsp paprika",
      "1 egg",
      "1 tbsp sugar",
      "1 tbsp olive oil",
      "1/2 cup milk",
      "1 tbsp butter",
      "salt to taste"
    ],
    instructions: [
      "Cook the beef with onion and paprika until fragrant.",
      "Blend the corn with milk and sugar to make a smooth topping.",
      "Layer the beef in a baking dish and cover with corn puree.",
      "Bake until the top is set and lightly golden.",
      "Finish with egg or butter for extra richness.",
      "Serve warm with salad."
    ],
    substitutions: [
      "Beef → Chicken",
      "Corn → Mashed potatoes",
      "Milk → Coconut milk"
    ]
  },
  {
    name: "Pabellón Criollo",
    category: "Venezuelan",
    country: "Venezuela",
    continent: "South America",
    meal: "Dinner",
    description:
      "A classic Venezuelan dish of rice, black beans, shredded beef, and fried plantains on one plate.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "400 g flank steak",
      "1 cup black beans",
      "2 cups rice",
      "2 plantains",
      "1 onion, chopped",
      "1 tsp cumin",
      "1 tbsp oil",
      "1 tomato, chopped",
      "1 tbsp garlic",
      "salt to taste"
    ],
    instructions: [
      "Cook the rice and black beans separately.",
      "Sear the steak with onion, garlic, and cumin until tender.",
      "Fry the plantains until golden and caramelized.",
      "Plate the rice, beans, beef, and plantains together.",
      "Top with tomato and a little onion.",
      "Serve warm and family-style."
    ],
    substitutions: [
      "Beef → Chicken",
      "Plantains → Sweet potato",
      "Black beans → Pinto beans"
    ]
  },
  {
    name: "Meat Pie",
    category: "Australian",
    country: "Australia",
    continent: "Oceania",
    meal: "Lunch",
    description:
      "A golden Australian savory pie filled with chunky beef mince and rich gravy.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "1 sheet puff pastry",
      "500 g beef mince",
      "1 onion, diced",
      "1 tbsp Worcestershire sauce",
      "1 cup beef stock",
      "1 tbsp flour",
      "1 tsp thyme",
      "1 egg",
      "1 tbsp oil",
      "salt to taste"
    ],
    instructions: [
      "Brown the beef mince with onion and seasonings.",
      "Stir in flour and stock to make a thick gravy filling.",
      "Cool slightly before filling pastry shells.",
      "Seal the edges and brush with egg.",
      "Bake until puffed and golden.",
      "Serve warm with salad or pickles."
    ],
    substitutions: [
      "Beef → Chicken",
      "Pastry → Shortcrust",
      "Worcestershire → Soy sauce"
    ]
  },
  {
    name: "Pavlova",
    category: "Australian",
    country: "Australia",
    continent: "Oceania",
    meal: "Dessert",
    description:
      "A crisp, cloud-like meringue dessert with a soft marshmallow center and fresh berries.",
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80",
    servings: 8,
    ingredients: [
      "4 egg whites",
      "1 cup sugar",
      "1 tsp vinegar",
      "1 tsp cornstarch",
      "1 tsp vanilla",
      "1 cup whipped cream",
      "1 cup berries",
      "1 tbsp mint",
      "1 tbsp icing sugar",
      "1 pinch salt"
    ],
    instructions: [
      "Whisk egg whites to soft peaks before adding the sugar gradually.",
      "Fold in vinegar, cornstarch, and vanilla for a stable meringue.",
      "Bake slowly until crisp and dry on the outside.",
      "Cool completely before topping with whipped cream.",
      "Decorate with berries and mint.",
      "Serve chilled for a crisp-soft contrast."
    ],
    substitutions: [
      "Berries → Kiwi",
      "Cream → Coconut cream",
      "Vanilla → Lemon zest"
    ]
  },
  {
    name: "Hāngi",
    category: "Maori",
    country: "New Zealand",
    continent: "Oceania",
    meal: "Dinner",
    description:
      "A traditional New Zealand earth-oven meal with smoky meat, vegetables, and the aroma of native herbs.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "600 g pork shoulder",
      "300 g chicken",
      "2 carrots, chopped",
      "1 sweet potato, cubed",
      "1 onion, quartered",
      "1 tbsp olive oil",
      "1 tbsp paprika",
      "1 lemon",
      "1 bunch herbs",
      "salt to taste"
    ],
    instructions: [
      "Season the meats and vegetables with oil, herbs, and paprika.",
      "Create the earth oven base with hot rocks and trays.",
      "Layer the meats and vegetables and cook slowly until tender.",
      "Seal the pit to allow even steaming.",
      "Open when the food is smoky, tender, and aromatic.",
      "Serve directly from the oven with fresh herbs."
    ],
    substitutions: [
      "Pork → Lamb",
      "Sweet potato → Kumara",
      "Herbs → Rosemary"
    ]
  },
  {
    name: "Goulash",
    category: "Hungarian",
    country: "Hungary",
    continent: "Europe",
    meal: "Dinner",
    description:
      "A paprika-rich Hungarian stew with beef, onions, peppers, and a warmly spiced, slow-simmered sauce.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g beef cubes",
      "2 onions, sliced",
      "2 tbsp paprika",
      "1 bell pepper, sliced",
      "2 tomatoes, chopped",
      "1 tbsp tomato paste",
      "1 cup stock",
      "1 tbsp oil",
      "1 tsp caraway seeds",
      "salt to taste"
    ],
    instructions: [
      "Brown the beef in oil and set aside.",
      "Cook onions and peppers until soft and sweet.",
      "Add paprika, tomato paste, and caraway, then stir well.",
      "Return the beef and add stock and tomatoes.",
      "Simmer gently until the meat is tender.",
      "Serve with potatoes or buttered noodles."
    ],
    substitutions: [
      "Beef → Pork",
      "Paprika → Sweet paprika",
      "Noodles → Bread"
    ]
  },
  {
    name: "Chicken Paprikash",
    category: "Hungarian",
    country: "Hungary",
    continent: "Europe",
    meal: "Dinner",
    description:
      "Tender chicken pieces in a creamy paprika sauce with onions, peppers, and a comforting finish.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g chicken thighs",
      "2 tbsp paprika",
      "1 onion, sliced",
      "1 bell pepper, sliced",
      "1 tomato, chopped",
      "1 cup stock",
      "1/2 cup cream",
      "1 tbsp flour",
      "2 tbsp oil",
      "salt to taste"
    ],
    instructions: [
      "Brown the chicken pieces in oil and set aside.",
      "Sauté onion and pepper until softened.",
      "Add paprika, tomato, and a little stock.",
      "Return the chicken and simmer until tender.",
      "Whisk flour into the cream and stir into the sauce.",
      "Serve with buttered noodles or dumplings."
    ],
    substitutions: [
      "Cream → Sour cream",
      "Chicken → Tofu",
      "Flour → Cornstarch"
    ]
  },
  {
    name: "Pierogi",
    category: "Polish",
    country: "Poland",
    continent: "Europe",
    meal: "Dinner",
    description:
      "Tender Polish dumplings filled with savory potato, cheese, or meat and served with butter and onions.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 cups flour",
      "1 egg",
      "1/2 cup water",
      "250 g potatoes, mashed",
      "150 g cheese",
      "1 onion, sautéed",
      "2 tbsp butter",
      "1 tbsp sour cream",
      "1 tsp salt",
      "pepper to taste"
    ],
    instructions: [
      "Make a smooth dough with flour, egg, and water.",
      "Roll the dough thin and fill with potato and cheese mixture.",
      "Seal and fold the dumplings carefully.",
      "Boil until they float and then fry gently in butter.",
      "Top with sautéed onions and sour cream.",
      "Serve hot with dill or chives."
    ],
    substitutions: [
      "Cheese → Mushrooms",
      "Potatoes → Sweet potato",
      "Butter → Olive oil"
    ]
  },
  {
    name: "Beef Stroganoff",
    category: "Russian",
    country: "Russia",
    continent: "Europe",
    meal: "Dinner",
    description:
      "A rich Russian beef dish in a creamy mushroom sauce, traditionally served over buttered noodles.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g beef strips",
      "200 g mushrooms",
      "1 onion, sliced",
      "1 cup sour cream",
      "1 cup stock",
      "2 tbsp flour",
      "2 tbsp butter",
      "1 tbsp mustard",
      "1 tsp paprika",
      "salt to taste"
    ],
    instructions: [
      "Sear the beef strips until browned and keep them aside.",
      "Cook the onions and mushrooms in butter until soft.",
      "Add flour and stock, stirring to thicken.",
      "Lower the heat and fold in sour cream and mustard.",
      "Return the beef and simmer gently.",
      "Serve with buttered noodles or rice."
    ],
    substitutions: [
      "Beef → Chicken",
      "Sour cream → Greek yogurt",
      "Mushrooms → Peas"
    ]
  },
  {
    name: "Swedish Meatballs",
    category: "Scandinavian",
    country: "Sweden",
    continent: "Europe",
    meal: "Dinner",
    description:
      "Classic Swedish meatballs in a creamy gravy with warm spices and a comforting Nordic finish.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g ground beef and pork",
      "1 small onion, grated",
      "1 egg",
      "1/2 cup breadcrumbs",
      "1/2 cup milk",
      "1 tbsp butter",
      "1 cup cream",
      "1 tbsp flour",
      "1/2 tsp nutmeg",
      "salt to taste"
    ],
    instructions: [
      "Mix the meat, onion, egg, breadcrumbs, milk, and nutmeg into a smooth mixture.",
      "Shape into small meatballs and gently pan-fry until browned.",
      "Bake or simmer until fully cooked.",
      "Build the gravy with butter, flour, and cream.",
      "Return the meatballs and simmer until silky.",
      "Serve with potatoes or lingonberry sauce."
    ],
    substitutions: [
      "Pork → Turkey",
      "Cream → Coconut cream",
      "Breadcrumbs → Oats"
    ]
  },
  {
    name: "Ratatouille",
    category: "French",
    country: "France",
    continent: "Europe",
    meal: "Dinner",
    description:
      "A rustic Provencal vegetable stew of eggplant, zucchini, tomato, and herbs in a slow-cooked embrace.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "1 eggplant, cubed",
      "1 zucchini, sliced",
      "2 tomatoes, chopped",
      "1 onion, chopped",
      "2 garlic cloves",
      "1 red bell pepper",
      "2 tbsp olive oil",
      "1 tbsp thyme",
      "1 tsp basil",
      "salt to taste"
    ],
    instructions: [
      "Sauté the onion and garlic with olive oil until soft.",
      "Add the vegetables in stages, allowing each to soften slightly.",
      "Season with thyme, basil, and salt.",
      "Simmer gently until the vegetables are tender and jammy.",
      "Allow the flavors to deepen for a few extra minutes.",
      "Serve with crusty bread or grilled chicken."
    ],
    substitutions: [
      "Eggplant → Courgette",
      "Tomato → Roasted red peppers",
      "Herbs → Rosemary"
    ]
  },
  {
    name: "Coq au Vin",
    category: "French",
    country: "France",
    continent: "Europe",
    meal: "Dinner",
    description:
      "A classic French chicken braise slowly cooked in red wine with mushrooms, pearl onions, and herbs.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g chicken thighs",
      "1 cup red wine",
      "200 g mushrooms",
      "1 onion, pearl",
      "2 garlic cloves",
      "1 tbsp flour",
      "1 tbsp butter",
      "1 tsp thyme",
      "1 bay leaf",
      "salt to taste"
    ],
    instructions: [
      "Brown the chicken and remove it from the pot.",
      "Cook onions and mushrooms in butter until glossy and rich.",
      "Add flour, then red wine, and scrape up the fond.",
      "Return the chicken and add thyme and bay leaf.",
      "Simmer gently until the chicken is tender.",
      "Serve with potatoes or crusty bread."
    ],
    substitutions: [
      "Chicken → Mushrooms",
      "Wine → Stock",
      "Pearl onion → Shallots"
    ]
  },
  {
    name: "Paella",
    category: "Spanish",
    country: "Spain",
    continent: "Europe",
    meal: "Dinner",
    description:
      "A saffron-scented Spanish rice dish with seafood, vegetables, and smoky, celebratory flavor.",
    image:
      "https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 cups rice",
      "200 g shrimp",
      "200 g mussels",
      "1 red pepper, sliced",
      "1 tomato, chopped",
      "1 onion, sliced",
      "1 pinch saffron",
      "2 tbsp olive oil",
      "1 liter stock",
      "1 tsp paprika"
    ],
    instructions: [
      "Sauté onion, pepper, and tomato in olive oil until softened.",
      "Add rice, paprika, and saffron, stirring to coat.",
      "Pour in the stock and bring to a boil.",
      "Add the shrimp and mussels and cook gently.",
      "Simmer until the rice is tender and the liquid is absorbed.",
      "Rest briefly before serving with lemon wedges."
    ],
    substitutions: [
      "Seafood → Chicken",
      "Stock → Vegetable stock",
      "Saffron → Turmeric"
    ]
  },
  {
    name: "Spanish Tortilla",
    category: "Spanish",
    country: "Spain",
    continent: "Europe",
    meal: "Brunch",
    description:
      "A classic Spanish omelet of potatoes, onions, and eggs, gently cooked until tender and golden.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "4 potatoes, thinly sliced",
      "1 onion, sliced",
      "6 eggs",
      "2 tbsp olive oil",
      "1 tbsp parsley",
      "1 tsp salt",
      "1/2 tsp pepper",
      "1 tbsp water",
      "1 tbsp butter",
      "1 lemon wedge"
    ],
    instructions: [
      "Cook the potatoes and onion slowly in olive oil until soft and lightly golden.",
      "Whisk the eggs with salt, pepper, and a tablespoon of water.",
      "Combine the potatoes with the eggs and let it settle.",
      "Pour the mixture into a skillet and cook gently.",
      "Flip once the base is set and cook the other side until golden.",
      "Serve warm with parsley and lemon."
    ],
    substitutions: [
      "Potatoes → Sweet potatoes",
      "Butter → Olive oil",
      "Parsley → Dill"
    ]
  },
  {
    name: "Greek Salad",
    category: "Greek",
    country: "Greece",
    continent: "Europe",
    meal: "Lunch",
    description:
      "A crisp Mediterranean salad with tomatoes, cucumber, olives, feta, and a lemon-olive oil dressing.",
    image:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 tomatoes, chopped",
      "1 cucumber, sliced",
      "1 red onion, sliced",
      "1/2 cup olives",
      "150 g feta",
      "2 tbsp olive oil",
      "1 tbsp lemon juice",
      "1 tsp oregano",
      "1 tbsp parsley",
      "salt to taste"
    ],
    instructions: [
      "Combine the chopped vegetables in a large bowl.",
      "Toss with olive oil, lemon juice, and oregano.",
      "Add olives and crumble feta over the top.",
      "Season lightly with salt and pepper.",
      "Add parsley just before serving.",
      "Serve fresh and chilled."
    ],
    substitutions: [
      "Feta → Goat cheese",
      "Olives → Capers",
      "Cucumber → Bell pepper"
    ]
  },
  {
    name: "Moussaka",
    category: "Greek",
    country: "Greece",
    continent: "Europe",
    meal: "Dinner",
    description:
      "A layered Greek casserole of aubergine, spiced mince, and creamy béchamel baked until golden and comforting.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 eggplants, sliced",
      "500 g lamb or beef",
      "1 onion, chopped",
      "2 tomatoes, chopped",
      "2 tbsp olive oil",
      "1 cup milk",
      "1 tbsp butter",
      "2 tbsp flour",
      "1 tsp cinnamon",
      "salt to taste"
    ],
    instructions: [
      "Roast or fry the eggplant slices until softened.",
      "Cook the mince with onion, tomatoes, cinnamon, and spice.",
      "Prepare a creamy béchamel with butter, flour, and milk.",
      "Layer eggplant and mince in a baking dish.",
      "Top with béchamel and bake until golden.",
      "Rest before slicing and serving."
    ],
    substitutions: [
      "Lamb → Beef",
      "Eggplant → Courgette",
      "Milk → Oat milk"
    ]
  },
  {
    name: "Fish and Chips",
    category: "British",
    country: "United Kingdom",
    continent: "Europe",
    meal: "Dinner",
    description:
      "A classic British dish of fried fish and chunky potato chips served with tartar sauce and lemon.",
    image:
      "https://images.unsplash.com/photo-1562967916-eb82221dfb92?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g white fish fillets",
      "600 g potatoes",
      "1 cup flour",
      "1 egg",
      "1 cup beer",
      "2 tbsp oil",
      "1 lemon",
      "1 tbsp parsley",
      "salt to taste",
      "tartar sauce"
    ],
    instructions: [
      "Cut the potatoes into thick chips and fry until crisp.",
      "Season the fish and coat it in flour.",
      "Dip into batter made with egg and beer.",
      "Fry the fish until golden and flaky.",
      "Serve with chips, lemon, and tartar sauce.",
      "Finish with salt and parsley."
    ],
    substitutions: [
      "Fish → Tofu",
      "Beer batter → Milk batter",
      "Potatoes → Sweet potato fries"
    ]
  },
  {
    name: "Shepherd's Pie",
    category: "British",
    country: "United Kingdom",
    continent: "Europe",
    meal: "Dinner",
    description:
      "A savory British pie of minced lamb in rich gravy topped with creamy mashed potato.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g lamb mince",
      "1 onion, diced",
      "2 carrots, diced",
      "2 tbsp flour",
      "1 cup stock",
      "800 g potatoes",
      "2 tbsp butter",
      "1/2 cup milk",
      "1 tbsp rosemary",
      "salt to taste"
    ],
    instructions: [
      "Cook the mince with onion and carrot until browned.",
      "Add flour and stock to create a thick, savory filling.",
      "Boil and mash the potatoes with butter and milk.",
      "Transfer the filling to a baking dish and top with mash.",
      "Bake until the top is golden and bubbling.",
      "Serve hot with peas or greens."
    ],
    substitutions: [
      "Lamb → Beef",
      "Potatoes → Sweet potatoes",
      "Milk → Oat milk"
    ]
  },
  {
    name: "Beef Wellington",
    category: "British",
    country: "United Kingdom",
    continent: "Europe",
    meal: "Dinner",
    description:
      "A refined British roast of beef wrapped in pastry, mushrooms, and savory pâté.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "600 g beef fillet",
      "1 sheet puff pastry",
      "200 g mushrooms, chopped",
      "2 tbsp mustard",
      "1 egg",
      "2 tbsp butter",
      "1 tbsp thyme",
      "1 tbsp oil",
      "1 tbsp shallot",
      "salt to taste"
    ],
    instructions: [
      "Sear the beef and let it cool.",
      "Cook the mushrooms with shallot and thyme until the moisture evaporates.",
      "Brush the beef with mustard and wrap it in the mushroom mixture.",
      "Encase with pastry and seal the edges.",
      "Bake until puffed and deeply golden.",
      "Rest before slicing and serving with vegetables."
    ],
    substitutions: [
      "Beef → Chicken",
      "Puff pastry → Shortcrust",
      "Mustard → Horseradish"
    ]
  },
  {
    name: "Bratwurst",
    category: "German",
    country: "Germany",
    continent: "Europe",
    meal: "Dinner",
    description:
      "German sausages grilled until juicy and served with mustard, sauerkraut, and soft buns.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "4 bratwurst sausages",
      "4 buns",
      "1 cup sauerkraut",
      "2 tbsp mustard",
      "1 onion, sliced",
      "1 tbsp oil",
      "1 tsp caraway",
      "1 tbsp butter",
      "1 tbsp parsley",
      "salt to taste"
    ],
    instructions: [
      "Grill or pan-fry the sausages until cooked through and browned.",
      "Sauté the onion until softened and lightly golden.",
      "Warm the buns and add mustard.",
      "Place the sausages in the buns and top with onions and sauerkraut.",
      "Finish with parsley and a little extra mustard.",
      "Serve with potato salad or fries."
    ],
    substitutions: [
      "Bratwurst → Chicken sausages",
      "Sauerkraut → Cabbage slaw",
      "Buns → Bread"
    ]
  },
  {
    name: "Schnitzel",
    category: "German",
    country: "Germany",
    continent: "Europe",
    meal: "Dinner",
    description:
      "A breaded and pan-fried cutlet with a crisp exterior and tender center, classic and comforting.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "4 pork cutlets",
      "1 cup flour",
      "1 egg",
      "1 cup breadcrumbs",
      "1 lemon",
      "2 tbsp butter",
      "1 tbsp parsley",
      "oil for frying",
      "salt to taste",
      "pepper to taste"
    ],
    instructions: [
      "Pound the pork cutlets to an even thickness.",
      "Coat them in flour, egg, and breadcrumbs.",
      "Fry in hot oil until crisp and golden.",
      "Drain on paper towels and season lightly.",
      "Serve with lemon wedges and parsley.",
      "Pair with potatoes or green salad."
    ],
    substitutions: [
      "Pork → Chicken",
      "Breadcrumbs → Panko",
      "Lemon → Pickle"
    ]
  },
  {
    name: "Pretzel",
    category: "German",
    country: "Germany",
    continent: "Europe",
    meal: "Snack",
    description:
      "A chewy, salted German pretzel with a golden crust and deeply satisfying doughy center.",
    image:
      "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g flour",
      "1 tsp yeast",
      "1 tsp sugar",
      "1/2 tsp salt",
      "1 cup warm water",
      "1 egg",
      "1 tbsp baking soda",
      "1 tbsp coarse salt",
      "1 tbsp butter",
      "1 tbsp oil"
    ],
    instructions: [
      "Dissolve the yeast and sugar in warm water.",
      "Mix in flour, salt, and butter to form dough.",
      "Knead until smooth and let rise until doubled.",
      "Shape into knots and dip briefly in baking soda water.",
      "Bake until deep golden and crusty.",
      "Brush with egg wash and finish with coarse salt."
    ],
    substitutions: [
      "Flour → Whole wheat flour",
      "Egg → Plant milk",
      "Coarse salt → Sesame"
    ]
  },
  {
    name: "Pastel de Nata",
    category: "Portuguese",
    country: "Portugal",
    continent: "Europe",
    meal: "Dessert",
    description:
      "A rich Portuguese custard tart with a buttery pastry shell and caramelized top.",
    image:
      "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80",
    servings: 8,
    ingredients: [
      "1 sheet puff pastry",
      "1 cup milk",
      "1/2 cup sugar",
      "3 egg yolks",
      "1 tbsp flour",
      "1 tsp vanilla",
      "1 cinnamon stick",
      "1 tbsp butter",
      "1 tbsp lemon zest",
      "1 pinch salt"
    ],
    instructions: [
      "Warm milk with cinnamon and vanilla to infuse the custard base.",
      "Whisk yolks, sugar, flour, and lemon zest until smooth.",
      "Temper with warm milk and cook until thickened.",
      "Fill pastry shells and bake until the tops caramelize.",
      "Cool briefly before serving.",
      "Enjoy warm with a cup of coffee."
    ],
    substitutions: [
      "Vanilla → Cinnamon",
      "Milk → Coconut milk",
      "Puff pastry → Shortcrust"
    ]
  },
  {
    name: "Bacalhau",
    category: "Portuguese",
    country: "Portugal",
    continent: "Europe",
    meal: "Dinner",
    description:
      "A traditional Portuguese cod dish prepared with potatoes, onions, and olive oil in a comforting one-pan style.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g salted cod",
      "3 potatoes, sliced",
      "1 onion, sliced",
      "2 tbsp olive oil",
      "2 garlic cloves",
      "1 tbsp parsley",
      "1/2 cup milk",
      "1 tsp paprika",
      "1 tbsp lemon juice",
      "salt to taste"
    ],
    instructions: [
      "Soak the cod and remove excess salt before cooking.",
      "Layer potatoes and onion in a baking tray with the cod.",
      "Season with garlic, paprika, and parsley.",
      "Drizzle with olive oil and a splash of milk.",
      "Bake until the potatoes are tender and the fish flakes easily.",
      "Serve with lemon and extra parsley."
    ],
    substitutions: [
      "Cod → Haddock",
      "Milk → Olive oil",
      "Potatoes → Sweet potatoes"
    ]
  },
  {
    name: "Moules-Frites",
    category: "Belgian",
    country: "Belgium",
    continent: "Europe",
    meal: "Dinner",
    description:
      "A classic Belgian dish of mussels steamed in white wine and served with golden fries.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "1 kg mussels",
      "500 g potatoes",
      "1 onion, sliced",
      "1 cup white wine",
      "2 tbsp butter",
      "2 garlic cloves",
      "1 tbsp parsley",
      "1 tbsp lemon juice",
      "1 tbsp oil",
      "salt to taste"
    ],
    instructions: [
      "Clean and debeard the mussels thoroughly.",
      "Steam the mussels with onion, garlic, wine, and butter until they open.",
      "Discard any that remain closed.",
      "Fry the potatoes until crisp and golden.",
      "Serve the mussels with the steaming broth and fries.",
      "Finish with parsley and lemon juice."
    ],
    substitutions: [
      "Mussels → Clams",
      "Fries → Mash",
      "Wine → Stock"
    ]
  },
  {
    name: "Cheese Fondue",
    category: "Swiss",
    country: "Switzerland",
    continent: "Europe",
    meal: "Dinner",
    description:
      "A cozy Swiss fondue of melted cheese, white wine, and a touch of garlic for dipping bread and vegetables.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "200 g Gruyère",
      "200 g Emmental",
      "1 cup white wine",
      "1 garlic clove",
      "1 tbsp cornstarch",
      "2 tbsp kirsch",
      "1 tbsp butter",
      "1 tsp nutmeg",
      "bread cubes",
      "baby potatoes"
    ],
    instructions: [
      "Rub the fondue pot with garlic and warm the wine gently.",
      "Add the cheeses gradually, stirring until smooth.",
      "Mix cornstarch with kirsch and stir into the cheese.",
      "Season with nutmeg and a little pepper.",
      "Keep warm and serve with bread and potatoes.",
      "Dip and enjoy in a convivial group style."
    ],
    substitutions: [
      "Gruyère → Swiss cheese",
      "Kirsch → Brandy",
      "Bread → Fruit"
    ]
  },
  {
    name: "Rösti",
    category: "Swiss",
    country: "Switzerland",
    continent: "Europe",
    meal: "Breakfast",
    description:
      "A Swiss potato rösti, crisp on the outside and soft inside, often served with eggs or cheese.",
    image:
      "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "500 g potatoes",
      "1 onion, grated",
      "1 tbsp butter",
      "1 tbsp oil",
      "1/2 tsp salt",
      "1/2 tsp pepper",
      "1 egg",
      "1/2 cup cheese",
      "1 tbsp parsley",
      "1 tbsp chives"
    ],
    instructions: [
      "Grate the potatoes and squeeze out excess moisture.",
      "Mix with onion, egg, cheese, and seasoning.",
      "Shape into a compact cake and pan-fry until crisp.",
      "Flip carefully and brown the other side.",
      "Serve with eggs, smoked salmon, or apples.",
      "Finish with chives and parsley."
    ],
    substitutions: [
      "Potatoes → Sweet potato",
      "Cheese → Gruyère",
      "Egg → None"
    ]
  },
  {
    name: "Wiener Schnitzel",
    category: "Austrian",
    country: "Austria",
    continent: "Europe",
    meal: "Dinner",
    description:
      "A classic Austrian cutlet with a crisp breadcrumb crust and a delicate, tender bite.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "4 veal cutlets",
      "1 cup flour",
      "1 egg",
      "1 cup breadcrumbs",
      "1 lemon",
      "2 tbsp butter",
      "oil for frying",
      "1 tsp salt",
      "1/2 tsp pepper",
      "1 tbsp parsley"
    ],
    instructions: [
      "Pound the veal gently to a uniform thickness.",
      "Bread the cutlets in flour, egg, and breadcrumbs.",
      "Fry until crisp and golden.",
      "Drain on paper towels briefly.",
      "Serve with lemon wedges and a side of potatoes.",
      "Finish with parsley for freshness."
    ],
    substitutions: [
      "Veal → Chicken",
      "Breadcrumbs → Panko",
      "Lemon → Pickle"
    ]
  },
  {
    name: "Apfelstrudel",
    category: "Austrian",
    country: "Austria",
    continent: "Europe",
    meal: "Dessert",
    description:
      "A flaky Austrian apple strudel with cinnamon-spiced fruit and a buttery pastry finish.",
    image:
      "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1200&q=80",
    servings: 6,
    ingredients: [
      "1 sheet strudel pastry",
      "4 apples, sliced",
      "1/2 cup sugar",
      "1 tsp cinnamon",
      "1/4 cup breadcrumbs",
      "2 tbsp butter",
      "1 tbsp lemon juice",
      "1/4 cup raisins",
      "1 tbsp vanilla",
      "1 tbsp icing sugar"
    ],
    instructions: [
      "Prepare the filling with apples, sugar, cinnamon, raisins, and lemon juice.",
      "Lay out the pastry and spread with breadcrumbs.",
      "Add the filling and roll the pastry to enclose it.",
      "Brush with butter and bake until deeply golden.",
      "Cool briefly before dusting with icing sugar.",
      "Serve warm with vanilla cream."
    ],
    substitutions: [
      "Apples → Pears",
      "Breadcrumbs → Oats",
      "Vanilla cream → Ice cream"
    ]
  },
  {
    name: "Jollof Rice",
    category: "West African",
    country: "Ghana",
    continent: "Africa",
    meal: "Dinner",
    description:
      "A rich Ghanaian tomato rice dish with vibrant herbs and a savory, peppery finish.",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 cups rice",
      "1 onion, chopped",
      "2 tomatoes, blended",
      "1 red pepper",
      "2 tbsp tomato paste",
      "1 tsp curry powder",
      "1 tsp thyme",
      "2 tbsp oil",
      "2 cups stock",
      "salt to taste"
    ],
    instructions: [
      "Sauté onion and pepper in oil until softened.",
      "Add tomato paste and blended tomato, simmering to a thick sauce.",
      "Stir in the spices and then the rice.",
      "Add stock and cook until the rice is tender and flavorful.",
      "Cover and steam to finish.",
      "Serve with grilled fish or chicken."
    ],
    substitutions: [
      "Rice → Brown rice",
      "Tomatoes → Roasted peppers",
      "Stock → Vegetable stock"
    ]
  },
  {
    name: "Koshari",
    category: "Egyptian",
    country: "Egypt",
    continent: "Africa",
    meal: "Lunch",
    description:
      "A beloved Egyptian staple combining rice, lentils, pasta, and chickpeas in a garlic-vinegar sauce.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "1 cup rice",
      "1 cup lentils",
      "1 cup pasta",
      "1 cup chickpeas",
      "2 tbsp vinegar",
      "2 tbsp garlic, minced",
      "2 tbsp tomato sauce",
      "1 tbsp cumin",
      "2 tbsp oil",
      "1 tbsp fried onions"
    ],
    instructions: [
      "Cook the rice, lentils, chickpeas, and pasta separately.",
      "Whisk vinegar, garlic, cumin, and tomato sauce into a dressing.",
      "Layer the components in a bowl or platter.",
      "Pour the sauce over the top and stir lightly.",
      "Finish with crisp fried onions.",
      "Serve warm with pickles or salad."
    ],
    substitutions: [
      "Pasta → Rice",
      "Chickpeas → White beans",
      "Vinegar → Lemon juice"
    ]
  },
  {
    name: "Ful Medames",
    category: "Egyptian",
    country: "Egypt",
    continent: "Africa",
    meal: "Breakfast",
    description:
      "A hearty Egyptian bean dish with lemon, olive oil, and herbs, traditionally enjoyed for breakfast or brunch.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "400 g fava beans",
      "2 tbsp olive oil",
      "1 lemon, juiced",
      "1 tbsp tahini",
      "1 garlic clove",
      "1 tsp cumin",
      "2 tbsp parsley",
      "1 tomato, chopped",
      "1 tbsp pickled onion",
      "salt to taste"
    ],
    instructions: [
      "Cook or warm the fava beans until soft.",
      "Mash lightly with a fork and season with olive oil and cumin.",
      "Mix in lemon juice and tahini until creamy.",
      "Top with parsley, tomato, and pickled onion.",
      "Add a little garlic if desired.",
      "Serve with warm bread and fresh vegetables."
    ],
    substitutions: [
      "Fava beans → White beans",
      "Tahini → Yogurt",
      "Lemon → Lime"
    ]
  },
  {
    name: "Mofongo",
    category: "Puerto Rican",
    country: "Puerto Rico",
    continent: "North America",
    meal: "Dinner",
    description:
      "A Puerto Rican favorite of mashed plantains with garlic, olive oil, and savory meat or seafood.",
    image:
      "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "4 green plantains",
      "4 garlic cloves",
      "2 tbsp olive oil",
      "200 g shrimp or pork",
      "1/2 cup broth",
      "1 tbsp cilantro",
      "salt to taste",
      "1/2 tsp black pepper",
      "1 onion, diced",
      "2 tbsp lime juice"
    ],
    instructions: [
      "Boil the green plantains until tender and drain.",
      "Mash with garlic, olive oil, and a little broth.",
      "Sauté the protein and onion until cooked.",
      "Fold the protein into the plantain mash.",
      "Finish with lime and cilantro.",
      "Serve hot with side salad or vegetables."
    ],
    substitutions: [
      "Pork → Chicken",
      "Plantain → Cassava",
      "Garlic → Onion"
    ]
  },
  {
    name: "Arroz con Gandules",
    category: "Puerto Rican",
    country: "Puerto Rico",
    continent: "North America",
    meal: "Dinner",
    description:
      "A savory Puerto Rican rice dish with pigeon peas, sofrito, and a savory, aromatic finish.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 cups rice",
      "1 cup pigeon peas",
      "1 onion, chopped",
      "1 green pepper, chopped",
      "2 garlic cloves",
      "1 tbsp sofrito",
      "1 tbsp olive oil",
      "2 cups stock",
      "1 tsp cumin",
      "1 tbsp cilantro"
    ],
    instructions: [
      "Sauté the sofrito base in oil until fragrant.",
      "Add the rice and coat with the aromatics.",
      "Stir in peas, stock, and cumin.",
      "Cook until the rice is tender and the liquid is absorbed.",
      "Cover and steam to finish.",
      "Serve with sliced tomato and cilantro."
    ],
    substitutions: [
      "Pigeon peas → Chickpeas",
      "Rice → Brown rice",
      "Sofrito → Italian seasoning"
    ]
  },
  {
    name: "Gallo Pinto",
    category: "Costa Rican",
    country: "Costa Rica",
    continent: "North America",
    meal: "Breakfast",
    description:
      "A classic Costa Rican breakfast of rice and beans served with onion, herbs, and a touch of seasoning.",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "2 cups cooked rice",
      "1 cup black beans",
      "1 onion, chopped",
      "1 bell pepper, chopped",
      "1 tbsp cilantro",
      "1 tbsp oil",
      "1 tsp cumin",
      "1 tbsp salsa",
      "1 egg",
      "salt to taste"
    ],
    instructions: [
      "Sauté onion and pepper in oil until softened.",
      "Add beans, cumin, and salsa and cook briefly.",
      "Fold in the rice and stir until evenly combined.",
      "Add cilantro and season to taste.",
      "Serve with fried egg and fruit.",
      "Enjoy as a hearty breakfast or lunch."
    ],
    substitutions: [
      "Black beans → Pinto beans",
      "Egg → Avocado",
      "Rice → Quinoa"
    ]
  },
  {
    name: "Feijoada",
    category: "Brazilian",
    country: "Brazil",
    continent: "South America",
    meal: "Dinner",
    description:
      "A robust Brazilian black bean and pork stew celebrated for its smoky depth and comforting richness.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    servings: 4,
    ingredients: [
      "300 g black beans",
      "200 g pork shoulder",
      "200 g smoked sausage",
      "1 onion, chopped",
      "2 garlic cloves",
      "1 tomato, chopped",
      "1 bay leaf",
      "1 tbsp olive oil",
      "1 tsp paprika",
      "salt to taste"
    ],
    instructions: [
      "Cook the beans until tender and reserve some cooking liquid.",
      "Brown the pork and sausage in a large pot.",
      "Add onion, garlic, tomato, bay leaf, and paprika.",
      "Combine with beans and enough liquid to make a thick stew.",
      "Simmer gently until richly flavored.",
      "Serve with rice, greens, and orange slices."
    ],
    substitutions: [
      "Pork → Turkey",
      "Beans → Kidney beans",
      "Sausage → Vegetarian sausage"
    ]
  }
];

export async function seedRecipes() {
  if (!MONGO_URI) {
    console.error("ERROR: MONGO_URI not found in backend/.env");
    process.exit(1);
  }

  try {
    const preparedCatalog = assignUniqueImages(recipeCatalog);
    validateRecipeImageAssignments(preparedCatalog);

    await mongoose.connect(MONGO_URI);

    const existingRecipes = await Recipe.find({}, { name: 1, image: 1, _id: 0 });
    const existingByName = new Map(
      existingRecipes.map((recipe) => [normalizeName(recipe.name), recipe])
    );

    let updatedCount = 0;
    let insertedCount = 0;

    for (const recipe of preparedCatalog) {
      const key = normalizeName(recipe.name);
      const currentRecipe = existingByName.get(key);

      if (currentRecipe) {
        const needsUpdate = currentRecipe.image !== recipe.image;
        if (needsUpdate) {
          await Recipe.updateOne({ name: currentRecipe.name }, { $set: { image: recipe.image } });
          updatedCount += 1;
        }
        continue;
      }

      await Recipe.create(recipe);
      insertedCount += 1;
    }

    const totalRecipes = await Recipe.countDocuments();

    console.log(`Inserted ${insertedCount} new recipes into the database.`);
    console.log(`Updated ${updatedCount} existing recipe image assignments.`);
    console.log(`Total recipes now: ${totalRecipes}`);
  } catch (error) {
    console.error("Recipe seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

if (process.argv[1] && process.argv[1].endsWith("seedRecipes.js")) {
  seedRecipes();
}
