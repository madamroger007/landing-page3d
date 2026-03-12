import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for optimized Docker production builds
  // This creates a minimal production bundle in .next/standalone
  images: {
    domains: ['res.cloudinary.com'], // Allow images from Cloudinary
  },

};

export default nextConfig;
