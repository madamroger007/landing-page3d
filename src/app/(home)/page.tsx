import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import HeroSection from "./components/HeroSection";
import AboutUs from "./components/AboutUs";
import AboutUsDetail from "./components/AboutUsDetail";
import DevicePreview from "./components/DevicePreview";
import PopularCollection from "../../components/card/PopularCollection";
import ArtworkCTA from "./components/ArtworkCTA";
import Footer from "../../components/Footer";
import BackgroundLayout from "../../components/BackgroundLayout";
import CustomCursor from "../../components/CustomCursor";
import WhatsAppFloatingButton from "../../components/WhatsAppFloatingButton";
import SectionWrapper from "../../components/SectionWrapper";

export const metadata: Metadata = {
  title: "Digital Services Agency | Website, Video, and Image Editing | MadamSpace",
  description:
    "MadamSpace provides digital services including website design, video editing, image editing, branding visuals, and other creative design solutions.",
  keywords: [
    "digital services",
    "website design",
    "video editing",
    "image editing",
    "graphic design service",
    "creative agency",
    "MadamSpace",
    "Jasa desain website",
    "Jasa edit video",
    "Jasa edit gambar",
    "Jasa desain grafis",
    "Jasa desain kreatif",
    "Jasa Design",
    "Jasa Edit Video",
    "Jasa Edit Gambar",
    "Jasa Desain Grafis",
    "Jasa Desain Kreatif",
    "Jasa",
    "Desain",
    "Edit Video",
    "Edit Gambar",
    "Desain Grafis",
    "Desain Kreatif",
    "Desain",
    "video",
    "gambar",
    "grafis",
    "kreatif",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Digital Services Agency | MadamSpace",
    description:
      "Website design, video editing, image editing, and creative digital services for brands and businesses.",
    url: process.env.NEXT_PUBLIC_APP_URL,
    type: "website",
  },
};

export default async function Home() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MadamSpace",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    description:
      "Digital services agency offering website design, video editing, image editing, and creative brand assets.",
    serviceType: [
      "Website Design",
      "Video Editing",
      "Image Editing",
      "Creative Design Services",
    ],
  };

  return (
    <>
      <main className="min-h-screen text-white selection:bg-neon-blue selection:text-white overflow-hidden relative">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />

        <BackgroundLayout />
        <CustomCursor />

        {/* Futuristic Frame Decorations */}
        <div className="futuristic-frame" />
        <div className="hud-line-v left" />
        <div className="hud-line-v right" />
        <div className="scanline" />
        <WhatsAppFloatingButton />

        <Navbar />

        <SectionWrapper id="home" className="bg-radial-[at_2%_8%]  from-[#547792]/20 via-[#000080]/40 to-[#000000]/80">
          <HeroSection />
        </SectionWrapper>

        <SectionWrapper id="about-us" className="bg-radial-[at_40%_80%] from-[#547792]/20 via-[#000080]/40 to-[#000000]/80">
          <AboutUs />
        </SectionWrapper>

        <SectionWrapper className="bg-radial-[at_40%_30%] from-[#547792]/20 via-[#000080]/40 to-[#000000]/80">
          <AboutUsDetail />
        </SectionWrapper>

        <SectionWrapper className="bg-radial-[at_40%_80%] from-[#547792]/20 via-[#000080]/40 to-[#000000]/80">
          <DevicePreview />
        </SectionWrapper>

        <SectionWrapper id="products" className="bg-radial-[at_40%_30%] from-[#547792]/20 via-[#000080]/40 to-[#000000]/80">
          <PopularCollection />
        </SectionWrapper>

        <SectionWrapper className="bg-radial-[at_40%_80%] from-[#547792]/20 via-[#000080]/40 to-[#000000]/80">
          <div className="glass-card rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden group border-white/10 shadow-3xl shadow-neon-blue/5">
            <div className="absolute inset-0  from-neon-blue/5 to-transparent opacity-40" />
            <ArtworkCTA />
          </div>
        </SectionWrapper>
        <Footer />
      </main>
    </>
  );
}
