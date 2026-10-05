function RecipeCard() {
  return (
    <div className="border p-4 rounded shadow">
      <img
        src="https://images.unsplash.com/photo-1555939594"
        alt="recipe"
        className="rounded"
      />

      <h2 className="text-xl font-bold mt-2">
        Italian Pasta
      </h2>

      <p>Tasty Italian recipe.</p>
    </div>
  );
}

export default RecipeCard;