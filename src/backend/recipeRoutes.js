import express from "express";
import Recipe from "../models/Recipe.js";

const router = express.Router();

/*
  GET ALL RECIPES
  GET /api/recipes
*/
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: recipes.length,
      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch recipes",
      error: error.message,
    });
  }
});

/*
  GET ONE RECIPE
  GET /api/recipes/:id
*/
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid recipe ID",
      error: error.message,
    });
  }
});

/*
  CREATE RECIPE
  POST /api/recipes
*/
router.post("/", async (req, res) => {
  try {
    const recipe = await Recipe.create(req.body);

    res.status(201).json({
      success: true,
      message: "Recipe created successfully",
      data: recipe,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create recipe",
      error: error.message,
    });
  }
});

/*
  UPDATE RECIPE
  PUT /api/recipes/:id
*/
router.put("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Recipe updated successfully",
      data: recipe,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update recipe",
      error: error.message,
    });
  }
});

/*
  DELETE RECIPE
  DELETE /api/recipes/:id
*/
router.delete("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Recipe deleted successfully",
      data: recipe,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to delete recipe",
      error: error.message,
    });
  }
});

export default router;