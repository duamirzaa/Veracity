import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { Upload, ScanSearch, Brain, Lightbulb, MessageSquare } from "lucide-react";

export function HowItWorksFigma() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const steps = [
    { icon: Upload, title: "Upload your project or code", number: "01" },
    { icon: ScanSearch, title: "We analyze code metrics", number: "02" },
    { icon: Brain, title: "ML model predicts risk level", number: "03" },
    { icon: Lightbulb, title: "AI explains key risk factors", number: "04" },
    { icon: MessageSquare, title: "Chatbot suggests improvements", number: "05" },
  ];

  return (
    <section ref={ref} className="relative py-32 px-6 overflow-hidden bg-black">
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl mb-4 text-white" style={{ fontWeight: 700, lineHeight: 1.2 }}>
            How Veracity Works
          </h2>
          <p className="text-lg text-[#99a1af]" style={{ fontWeight: 400 }}>
            Simple, intelligent workflow from code to insights
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative flex items-center justify-center gap-[173px] mb-20"
        >
          <div className="absolute top-1/2 left-[58px] right-[58px] h-[2px]">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 866 2" fill="none">
              <line
                x1="0"
                y1="1"
                x2="866"
                y2="1"
                stroke="url(#paint0_linear)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="paint0_linear" x1="0" y1="1" x2="866" y2="1" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#14A085" />
                  <stop offset="0.538462" stopColor="#073A30" />
                  <stop offset="1" stopColor="#14A085" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1, type: "spring" }}
              className="relative z-10 w-[58px] h-[58px] bg-[#14a085] rounded-full flex items-center justify-center"
            >
              <span className="text-white text-sm" style={{ fontWeight: 700 }}>
                {step.number}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-5 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 transition-all duration-500 hover:border-[#14a085]/30"
            >
              <div className="mb-6 w-12 h-12 rounded-xl bg-[#14a085]/10 flex items-center justify-center">
                <step.icon className="w-6 h-6 text-[#14a085]" strokeWidth={1.5} />
              </div>

              <p className="text-sm text-[#d1d5dc] leading-relaxed" style={{ fontWeight: 500 }}>
                {step.title}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
