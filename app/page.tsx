import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import CollectionFeature from "./components/CollectionFeature";
import FeaturesDetail from "./components/FeaturesDetail";
import DevicePreview from "./components/DevicePreview";
import PopularCollection from "./components/PopularCollection";
import ArtworkCTA from "./components/ArtworkCTA";
import Newsletter from "./components/Newsletter";
import Footer from "./components/Footer";
import Web3Background from "./components/Web3Background";
import CustomCursor from "./components/CustomCursor";
import { AgentProvider } from "./components/agent/AgentContext";
import PromptAgentPanel from "./components/agent/PromptAgentPanel";

const SectionWrapper = ({
  children,
  glowColor = "blue",
  glowPosition = "c",
  className = ""
}: {
  children: React.ReactNode,
  glowColor?: "blue" | "purple" | "pink" | "none",
  glowPosition?: "c" | "tr" | "tl" | "br" | "bl",
  className?: string
}) => (
  <section className={`section-frame ${className}`}>
    <div className="container mx-auto px-6 relative z-10 py-24 md:py-32">
      {children}
    </div>
    {glowColor !== "none" && (
      <div className={`glow-overlay glow-pos-${glowPosition} ${glowColor === "blue" ? "glow-blue" :
        glowColor === "purple" ? "glow-purple" : "glow-pink"
        }`} />
    )}
    <div className="absolute inset-0 section-inner-glow pointer-events-none" />
  </section>
);

export default function Home() {
  return (
    <AgentProvider>
      <main className="min-h-screen text-white selection:bg-neon-blue selection:text-white overflow-hidden relative">
        <Web3Background />
        <CustomCursor />

        {/* Futuristic Frame Decorations */}
        <div className="futuristic-frame" />
        <div className="hud-line-v left" />
        <div className="hud-line-v right" />
        <div className="scanline" />

        <Navbar />

        <SectionWrapper glowColor="blue" glowPosition="tr">
          <HeroSection />
        </SectionWrapper>

        <SectionWrapper glowColor="purple" glowPosition="bl">
          <CollectionFeature />
        </SectionWrapper>

        <SectionWrapper glowColor="none" className="bg-black/20">
          <FeaturesDetail />
        </SectionWrapper>

        <SectionWrapper glowColor="pink" glowPosition="tr">
          <DevicePreview />
        </SectionWrapper>

        <SectionWrapper glowColor="blue" glowPosition="c">
          <PopularCollection />
        </SectionWrapper>

        <SectionWrapper glowColor="blue" glowPosition="tr" className="bg-black/10">
          <div className="glass-card rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden group border-white/10 shadow-3xl shadow-neon-blue/5">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-transparent opacity-40" />
            <ArtworkCTA />
          </div>
        </SectionWrapper>

        <SectionWrapper glowColor="purple" glowPosition="tl" className="bg-black/5">
          <div className="glass-card rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden group border-white/10 shadow-3xl shadow-neon-purple/5">
            <div className="absolute inset-0 bg-gradient-to-tr from-neon-purple/5 to-transparent opacity-40" />
            <Newsletter />
          </div>
        </SectionWrapper>

        <Footer />

        {/* AI Prompt Agent UI */}
        <PromptAgentPanel />
      </main>
    </AgentProvider>
  );
}
