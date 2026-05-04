import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Play } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const router = useRouter();

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden bg-black">
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-b from-[#14a085]/20 to-transparent rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl mb-6 text-white"
          style={{ fontWeight: 700, lineHeight: 1.15 }}
        >
          Start Building Smarter,<br />Safer Software
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
          style={{ lineHeight: 1.7, fontWeight: 400 }}
        >
          Don&apos;t wait for bugs to appear. Predict, understand, and fix risks early with Veracity&apos;s AI-powered insights.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={() => router.push("/auth/register")}
            className="group px-10 py-5 bg-[#14a085] hover:bg-[#12916f] rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(20,160,133,0.5)] hover:scale-105 flex items-center gap-2"
          >
            <span className="text-white text-lg" style={{ fontWeight: 600 }}>Get Started</span>
            <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          <a 
            href="https://youtu.be/UNJJmSJnM8k" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-10 py-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20 flex items-center gap-2 inline-flex cursor-pointer"
          >
            <Play className="w-5 h-5 text-white" />
            <span className="text-lg" style={{ fontWeight: 600 }}>Try Demo</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
