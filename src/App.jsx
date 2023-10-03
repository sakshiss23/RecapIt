import Hero from "./components/Hero";
import HeroBottom from "./components/HeroBottom";

import "./App.css";

const App = () => {
  return (
    <main>
      <div className="main">
        <div className="gradient" />
      </div>

      <div className="app">
        <Hero />
        <HeroBottom />
      </div>
    </main>
  );
};

export default App;
