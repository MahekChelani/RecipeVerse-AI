import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      trim: true
    },

    country: {
      type: String,
      required: true,
      trim: true
    },

    continent: {
      type: String,
      required: true,
      trim: true
    },

    meal: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    image: {
      type: String,
      default: ""
    },

    servings: {
      type: Number,
      default: 4,
      min: 1
    },

    ingredients: {
      type: [String],
      default: []
    },

    instructions: {
      type: [String],
      default: []
    },

    substitutions: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;