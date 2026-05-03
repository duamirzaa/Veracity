import { motion } from "motion/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Frame from "../imports/Frame1/Frame1";

export function Navbar() {
  const [activeLink, setActiveLink] = useState("About");
  const navLinks = [
    { label: "About", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "Contact", href: "#footer" },
    { label: "Subscription", href: "#subscription" },
  ];
  const router = useRouter();

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full flex justify-center items-center z-50 px-4 md:px-6 font-sans"
    >
      <div className="relative inline-flex items-center gap-6 md:gap-8 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full px-6 md:px-8 py-3 md:py-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <Link href="/" className="flex items-center gap-2 h-[30px] hover:opacity-80 transition-opacity cursor-pointer">
          <Frame />
        </Link>

        <div className="hidden md:flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full p-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setActiveLink(link.label)}
                className={`relative px-6 py-2.5 rounded-full text-sm transition-all duration-300 font-sans ${
                  activeLink === link.label
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                style={{ fontWeight: 500 }}
              >
                {activeLink === link.label && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#14a085] rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            ))}
          </div>

        <button
          onClick={() => router.push("/auth/register")}
          className="px-6 md:px-8 py-2.5 md:py-3 bg-[#14a085] hover:bg-[#128f75] text-white text-sm rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,160,133,0.5)] hover:scale-105 font-sans whitespace-nowrap"
        >
          <span style={{ fontWeight: 600 }}>Get Started</span>
        </button>
      </div>
    </motion.nav>
  );
}
