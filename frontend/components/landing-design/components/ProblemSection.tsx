import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { AlertTriangle, TrendingDown, Search } from "lucide-react";

export function ProblemSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden bg-black">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block mb-4 px-4 py-2 bg-[#14a085]/10 border border-[#14a085]/30 rounded-full">
              <span className="text-[#14a085] text-sm" style={{ fontWeight: 500 }}>The Problem</span>
            </div>

            <h2 className="text-4xl md:text-5xl mb-6 text-white" style={{ fontWeight: 700, lineHeight: 1.2 }}>
              Most Software Failures<br />Aren&apos;t Sudden — They<br />Build Up Quietly
            </h2>

            <p className="text-lg text-gray-400 mb-8" style={{ lineHeight: 1.7, fontWeight: 400 }}>
              Technical debt, hidden complexity, and poor visibility often lead to project failure. Traditional tools show raw metrics — but they don&apos;t tell you what actually matters or how to fix it.
            </p>

            <div className="space-y-4">
              {[
                { icon: AlertTriangle, text: "Risks detected too late in development" },
                { icon: TrendingDown, text: "Metrics without actionable insights" },
                { icon: Search, text: "No intelligent guidance for developers" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#14a085]/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-[#14a085]" strokeWidth={1.5} />
                  </div>
                  <p className="text-gray-300" style={{ fontWeight: 400 }}>{item.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/5">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                  <span className="text-gray-300 text-sm">Critical Issues</span>
                  <span className="text-red-400" style={{ fontWeight: 600 }}>47</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
                  <span className="text-gray-300 text-sm">High Risk Modules</span>
                  <span className="text-orange-400" style={{ fontWeight: 600 }}>23</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                  <span className="text-gray-300 text-sm">Code Complexity</span>
                  <span className="text-yellow-400" style={{ fontWeight: 600 }}>High</span>
                </div>
                <div className="mt-6 p-6 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-gray-400 text-sm mb-2">Without Veracity:</p>
                  <p className="text-red-400 text-xs" style={{ fontWeight: 400 }}>
                    Raw metrics with no context or actionable guidance
                  </p>
                </div>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-br from-red-500/10 to-transparent rounded-3xl blur-2xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
