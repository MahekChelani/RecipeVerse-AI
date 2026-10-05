import express from "express";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

const router = express.Router();

const emitRecipeChange = (req, eventName, recipe, verb) => {
  const io = req.app.get("io");
  if (!io) return;

  const recipeData = recipe.toJSON();
  const id = String(recipe._id);
  const timestamp = new Date().toISOString();
  const message = `${verb}: ${recipe.name}`;

  io.emit(eventName, {
    id,
    name: recipe.name,
    country: recipe.country,
    category: recipe.category,
    message,
    timestamp,
    recipe: { ...recipeData, _id: id }
  });
  io.emit("notification", {
    id: `${eventName}:${id}:${timestamp}`,
    type: eventName,
    message,
    timestamp
  });
  io.emit("activity", {
    id: `${eventName}:${id}:${timestamp}`,
    type: eventName,
    name: recipe.name,
    message,
    timestamp
  });
};

const recipeValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Recipe name is required")
    .isLength({ max: 100 })
    .withMessage("Recipe name must not exceed 100 characters"),

  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),

  body("country")
    .trim()
    .notEmpty()
    .withMessage("Country is required"),

  body("continent")
    .trim()
    .notEmpty()
    .withMessage("Continent is required"),

  body("meal")
    .trim()
    .notEmpty()
    .withMessage("Meal is required"),

  body("servings")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Servings must be between 1 and 100")
];

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array()
    });
  }

  next();
};

// GET all recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recipes"
    });
  }
});

// GET one recipe
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe ID"
      });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found"
      });
    }

    res.status(200).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recipe"
    });
  }
});

// POST recipe
router.post(
  "/",
  recipeValidation,
  checkValidation,
  async (req, res) => {
    try {
      const recipe = await Recipe.create(req.body);
      emitRecipeChange(req, "recipe:created", recipe, "New recipe added");

      res.status(201).json({
        success: true,
        message: "Recipe created successfully",
        data: recipe
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Failed to create recipe"
      });
    }
  }
);

// PUT recipe
router.put(
  "/:id",
  recipeValidation,
  checkValidation,
  async (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid recipe ID"
        });
      }

      const recipe = await Recipe.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );

      if (!recipe) {
        return res.status(404).json({
          success: false,
          message: "Recipe not found"
        });
      }

      emitRecipeChange(req, "recipe:updated", recipe, "Recipe updated");

      res.status(200).json({
        success: true,
        message: "Recipe updated successfully",
        data: recipe
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "Failed to update recipe"
      });
    }
  }
);

// DELETE recipe
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipe ID"
      });
    }

    const recipe = await Recipe.findByIdAndDelete(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found"
      });
    }

    emitRecipeChange(req, "recipe:deleted", recipe, "Recipe deleted");

    res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
      data: recipe
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete recipe"
    });
  }
});

export default router;