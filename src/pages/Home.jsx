import { useState } from "react";
import Hero from "../components/Hero";
import Recipes from "../components/Recipes";
import Features from "../components/Features";
import FAQ from "../components/FAQ";

function Home() {
  const [search, setSearch] = useState("");

  return (
    <>
      <Hero onSearch={setSearch} />
      <Recipes search={search} onSearch={setSearch} />
      <Features />
      <FAQ />
    </>
  );
}

export default Home;
