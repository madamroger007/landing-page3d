"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Wallet, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", href: "#" },
  { name: "Collection", href: "#collection" },
  { name: "Feature", href: "#feature" },
  { name: "Help", href: "#help" },
  { name: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass-nav py-4" : "bg-transparent py-6"
        }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-neon-purple to-neon-blue rounded-xl flex items-center justify-center shadow-lg shadow-neon-blue/20">
            <span className="text-white font-syne font-bold text-xl">N</span>
          </div>
          <span className="text-2xl font-syne font-bold tracking-tight text-white group-hover:neon-text transition-all">
            NFT<span className="text-neon-blue">Space</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-white/70 hover:text-white transition-colors font-medium text-sm tracking-wide"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-6">
          <div className="relative group">
            <input
              type="text"
              placeholder="Search..."
              className="bg-white/5 border border-white/10 rounded-full py-2 px-10 text-sm focus:outline-none focus:border-neon-blue/50 focus:bg-white/10 transition-all w-48 group-hover:w-64"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-neon-blue transition-colors" />
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-neon-blue to-neon-purple px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-neon-purple/20 hover:scale-105 active:scale-95 transition-all">
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed inset-0 z-50 glass-nav overflow-hidden flex flex-col items-center justify-center"
          >
            <button
              className="absolute top-6 right-6 text-white p-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-8 h-8" />
            </button>
            <div className="flex flex-col items-center gap-8 text-center">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="text-3xl font-syne font-bold text-white/70 hover:text-neon-blue transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
                className="pt-8"
              >
                <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-neon-blue to-neon-purple px-10 py-4 rounded-full font-bold text-lg shadow-xl shadow-neon-purple/20">
                  <Wallet className="w-6 h-6" />
                  Connect Wallet
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
