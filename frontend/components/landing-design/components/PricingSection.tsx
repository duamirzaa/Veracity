import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

export function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const router = useRouter();

  const tiers = [
    {
      name: "Student",
      description: "Ideal for learning and academic projects",
      features: [
        "5 project creation limit",
        "Basic SHAP explanations",
        "Email support",
        "Community access",
        "Free PDF reports",
      ],
      cta: "Verify Academic Status",
      popular: false,
    },
    {
      name: "Free",
      description: "Great for getting started with defect prediction",
      features: [
        "5 project creation limit",
        "Basic SHAP explanations",
        "Community support",
        "JSON/XML reports",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      description: "Advanced features for professional developers",
      features: [
        "Unlimited code analyses",
        "Detailed PDF reports",
        "Priority AI support",
        "Full analytics dashboard",
        "API access",
        "Dynamic mitigation strategies",
      ],
      cta: "Upgrade Now",
      popular: true,
    },
  ];

  return (
    <section id="subscription" ref={ref} className="relative py-32 px-6 overflow-hidden bg-black">
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl mb-4 text-white" style={{ fontWeight: 700, lineHeight: 1.2 }}>
            Simple, Flexible Pricing
          </h2>
          <p className="text-lg text-gray-400" style={{ fontWeight: 400 }}>
            Choose the plan that fits your needs
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`relative p-8 rounded-3xl backdrop-blur-sm transition-all duration-500 ${
                tier.popular
                  ? "bg-gradient-to-b from-[#14a085]/10 to-[#0a0a0a] border-2 border-[#14a085]/50 shadow-[0_0_50px_rgba(20,160,133,0.2)] scale-105"
                  : "bg-[#0a0a0a] border border-white/5 hover:border-white/10"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#14a085] rounded-full">
                  <span className="text-white text-sm" style={{ fontWeight: 600 }}>Most Popular</span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl mb-2 text-white" style={{ fontWeight: 700 }}>
                  {tier.name}
                </h3>
                <p className="text-gray-400 text-sm" style={{ fontWeight: 400 }}>
                  {tier.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-[#14a085]/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#14a085]" strokeWidth={3} />
                    </div>
                    <span className="text-gray-300 text-sm" style={{ lineHeight: 1.6, fontWeight: 400 }}>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => {
                  if (tier.name === 'Student') {
                    alert("To access student benefits, please register a new account using your institution's academic email.");
                    router.push("/auth/register");
                  } else {
                    router.push("/auth/login");
                  }
                }}
                className={`w-full py-4 rounded-full transition-all duration-300 ${
                  tier.popular
                    ? "bg-[#14a085] text-white hover:bg-[#12916f] hover:shadow-[0_0_30px_rgba(20,160,133,0.4)]"
                    : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                }`}
              >
                <span style={{ fontWeight: 600 }}>{tier.cta}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
