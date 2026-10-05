const features = [
  {
    title: "AI Voice Assistant",
    description:
      "Cook hands-free with step-by-step voice guidance while your hands stay busy.",
    image:
      "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Camera Cooking Assistant",
    description:
      "Use visual recognition to understand ingredients and discover useful cooking ideas.",
    image:
      "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "Smart Ingredient Scanner",
    description:
      "Find recipes based on ingredients already available in your kitchen.",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=700&q=85",
  },
  {
    title: "AI Meal Planner",
    description:
      "Create personalized meal plans according to your preferences, schedule and servings.",
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=700&q=85",
  },
];

function Features() {
  return (
    <section
      id="features"
      className="bg-gray-900 py-20 px-6"
    >
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="max-w-2xl mb-12">
          <p className="text-orange-400 uppercase tracking-wider font-bold text-sm">
            Cook Smarter
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3">
            Powerful Features
          </h2>

          <p className="text-gray-400 mt-4 text-lg leading-7">
            Smart technology designed to make planning, discovering and
            cooking recipes easier.
          </p>
        </div>

        {/* FEATURE CARDS */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

          {features.map((feature) => (
            <article
              key={feature.title}
              className="group bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:bg-white/10 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
            >

              {/* IMAGE */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              {/* CONTENT */}
              <div className="p-6">

                <h3 className="text-xl font-bold text-white">
                  {feature.title}
                </h3>

                <p className="text-gray-400 mt-3 leading-7">
                  {feature.description}
                </p>

                <button
                  type="button"
                  className="mt-5 text-orange-400 font-semibold hover:text-orange-300 transition"
                >
                  Explore feature →
                </button>

              </div>

            </article>
          ))}

        </div>

      </div>
    </section>
  );
}

export default Features;