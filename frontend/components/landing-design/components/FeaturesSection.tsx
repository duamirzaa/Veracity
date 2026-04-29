import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { Target, Eye, Bot, Users, BarChart3, Shield } from "lucide-react";

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    {
      icon: Target,
      title: "Risk Prediction",
      description: "Identify high-risk modules using advanced machine learning models trained on real-world datasets.",
    },
    {
      icon: Eye,
      title: "Explainable AI",
      description: "No more black-box results. Understand exactly which factors are causing risk in your project.",
    },
    {
      icon: Bot,
      title: "AI Chat Assistant",
      description: "Get instant, human-like guidance on how to reduce risks and improve your code quality.",
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Manage access across teams with structured roles for developers, managers, and admins.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Track risk trends and system performance with detailed analytics and exportable reports.",
    },
    {
      icon: Shield,
      title: "Code Security",
      description: "Protect your codebase from vulnerabilities with proactive security analysis.",
    },
  ];

  return (
    <section id="features" ref={ref} className="relative py-32 px-6 overflow-hidden bg-black">
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl mb-4 text-white" style={{ fontWeight: 700, lineHeight: 1.2 }}>
            Powerful Features
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto" style={{ fontWeight: 400 }}>
            Everything you need to build safer, more reliable software
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 transition-all duration-500 hover:border-[#14a085]/20 hover:bg-[#0f0f0f]"
            >
              <div className="mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#14a085]/5 to-[#14a085]/10 flex items-center justify-center group-hover:from-[#14a085]/10 group-hover:to-[#14a085]/20 transition-all duration-300">
                <feature.icon className="w-8 h-8 text-[#14a085]" strokeWidth={1.5} />
              </div>

              <h3 className="text-xl mb-3 text-white" style={{ fontWeight: 600 }}>
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed" style={{ fontWeight: 400 }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
