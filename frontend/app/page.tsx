"use client";

import { Navigation } from "../components/navigation";
import { Hero } from "../components/hero";
import { ApiDemo } from "../components/api-demo";
import { Capabilities } from "../components/capabilities";
import { Pricing } from "../components/pricing";
import { Coverage } from "../components/coverage";
import { Footer } from "../components/footer";

export default function Home() {
  return (
    <main className="relative">
      <Navigation />
      
      <Hero />
      
      <div id="capabilities">
        <Capabilities />
      </div>

      <Pricing />
      
      <div id="coverage">
        <Coverage />
      </div>
      
      <Footer />
    </main>
  );
}
