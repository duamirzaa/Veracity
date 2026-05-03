import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { Brain, Lightbulb, MessageSquare } from "lucide-react";

export function SolutionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-20 sm:py-24 md:py-32 px-6 overflow-hidden bg-black">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/5">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#14a085]/10 border border-[#14a085]/30">
                  <span className="text-gray-300 text-sm">Risk Score</span>
                  <span className="text-[#14a085]" style={{ fontWeight: 600 }}>32%</span>
                </div>

                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#14a085]/20 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-[#14a085]" />
                    </div>
                    <span className="text-white text-sm" style={{ fontWeight: 600 }}>ML Prediction</span>
                  </div>
                  <p className="text-gray-400 text-xs" style={{ lineHeight: 1.6 }}>
                    High complexity in auth module detected
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#14a085]/20 flex items-center justify-center">
                      <Lightbulb className="w-4 h-4 text-[#14a085]" />
                    </div>
                    <span className="text-white text-sm" style={{ fontWeight: 600 }}>AI Explanation</span>
                  </div>
                  <p className="text-gray-400 text-xs" style={{ lineHeight: 1.6 }}>
                    Cyclomatic complexity and dependencies are primary factors
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[#14a085]/20 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-[#14a085]" />
                    </div>
                    <span className="text-white text-sm" style={{ fontWeight: 600 }}>Chatbot Guidance</span>
                  </div>
                  <p className="text-gray-400 text-xs" style={{ lineHeight: 1.6 }}>
                    Consider refactoring into smaller functions and reducing coupling
                  </p>
                </div>
              </div>
              <div className="absolute -inset-4 bg-gradient-to-br from-[#14a085]/10 to-transparent rounded-3xl blur-2xl -z-10" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <div className="inline-block mb-4 px-4 py-2 bg-[#14a085]/10 border border-[#14a085]/30 rounded-full">
              <span className="text-[#14a085] text-sm" style={{ fontWeight: 500 }}>The Solution</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl mb-6 text-white" style={{ fontWeight: 700, lineHeight: 1.2 }}>
              Meet Veracity —<br />Your AI Risk Advisor
            </h2>

            <p className="text-lg text-gray-400 mb-6" style={{ lineHeight: 1.7, fontWeight: 400 }}>
              Veracity transforms complex code metrics into clear, explainable insights. It not only predicts risks but also explains why they occur and how to fix them.
            </p>

            <div className="space-y-4">
              {[
                { icon: Brain, text: "Predict defect risks using ML" },
                { icon: Lightbulb, text: "Understand decisions with Explainable AI" },
                { icon: MessageSquare, text: "Get instant guidance through chatbot" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
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
        </div>
      </div>
    </section>
  );
}
