function Hero({ onSearch }) {
  return (
    <section id="home" className="bg-orange-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">

        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* LEFT */}
          <div>

            <span className="inline-flex items-center bg-white border border-orange-100 shadow-sm px-4 py-2 rounded-full text-orange-600 font-semibold text-sm">
              🤖 AI-Powered Recipe Assistant
            </span>

            <h1 className="text-5xl md:text-6xl xl:text-7xl font-bold text-gray-900 leading-[1.05] mt-6">
              Your Kitchen
              <span className="block text-orange-500">
                Speaks Your Language.
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 leading-8 max-w-xl">
              Discover authentic recipes from around the world,
              personalize servings, explore cuisines and cook smarter
              with RecipeVerse AI.
            </p>

            {/* SEARCH */}
            <div className="mt-8 bg-white rounded-2xl p-2 shadow-xl flex flex-col sm:flex-row gap-2 max-w-xl">

              <input
                type="text"
                placeholder="Search recipes, countries or cuisines..."
                onChange={(e) => onSearch?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    document
                      .getElementById("recipes")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="flex-1 px-4 py-3 outline-none text-gray-700 rounded-xl"
              />

              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("recipes")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="bg-orange-500 text-white px-7 py-3 rounded-xl font-bold hover:bg-orange-600 transition"
              >
                Explore
              </button>

            </div>

            {/* HIGHLIGHTS */}
            <div className="flex flex-wrap gap-3 mt-6">

              {[
                "Global Cuisines",
                "Smart Search",
                "Personalized Portions",
                "AI Assistance",
              ].map((item) => (
                <span
                  key={item}
                  className="bg-white px-4 py-2 rounded-full text-sm text-gray-600 shadow-sm"
                >
                  ✓ {item}
                </span>
              ))}

            </div>

          </div>

          {/* RIGHT */}
          <div className="relative">

            <div className="absolute -inset-6 bg-orange-200/40 rounded-[3rem] blur-3xl" />

            <img
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85"
              alt="World cuisine"
              className="relative w-full h-[400px] md:h-[500px] object-cover rounded-[2rem] shadow-2xl"
            />

            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-xl">

              <p className="text-xs uppercase tracking-wider text-orange-500 font-bold">
                Discover the world
              </p>

              <p className="text-gray-900 font-bold text-lg mt-1">
                Thousands of flavours. One kitchen.
              </p>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default Hero;