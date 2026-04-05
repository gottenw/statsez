"use client";

import { Navigation } from "../components/navigation";
import { Hero } from "../components/hero";
import { Capabilities } from "../components/capabilities";
import { Pricing } from "../components/pricing";
import { Coverage } from "../components/coverage";
import { Footer } from "../components/footer";

export default function Home() {
  return (
    <main className="relative">
      <Navigation />

      <Hero />

      <div className="h-16 md:h-24 bg-background" />

      <div id="capabilities">
        <Capabilities />
      </div>

      <div className="h-16 md:h-24 bg-background" />

      <Pricing />

      <div className="h-16 md:h-24 bg-background" />

      <div id="coverage">
        <Coverage />
      </div>

      <div className="h-16 md:h-24 bg-background" />

      <Footer />
    </main>
  );
}
