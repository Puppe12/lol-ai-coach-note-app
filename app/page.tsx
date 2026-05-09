import Image from "next/image";
import HeroSection from "@/app/components/HeroSection";
import FeaturesSection from "@/app/components/FeaturesSection";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)]">
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-between gap-12 px-6 py-12 sm:px-8 lg:px-0 lg:py-16">
        <HeroSection />
        <FeaturesSection />
      </main>
    </div>
  );
}
