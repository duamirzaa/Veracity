import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { Code2, BriefcaseBusiness, GraduationCap, Users, Laptop, Terminal, FileCode, GitBranch, Blocks } from "lucide-react";

export function IntegrationSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const tools = [
    { icon: FileCode, position: { x: -220, y: -140 }, delay: 0, rotate: -15 },
    { icon: Terminal, position: { x: 220, y: -160 }, delay: 0.2, rotate: 15 },
    { icon: FileCode, position: { x: -200, y: 140 }, delay: 0.4, rotate: -10 },
    { icon: GitBranch, position: { x: 200, y: 120 }, delay: 0.6, rotate: 12 },
    { icon: Laptop, position: { x: -280, y: -20 }, delay: 0.3, rotate: -20 },
    { icon: Blocks, position: { x: 280, y: 0 }, delay: 0.5, rotate: 18 },
    { icon: Code2, position: { x: 0, y: -200 }, delay: 0.1, rotate: 0 },
    { icon: BriefcaseBusiness, position: { x: 0, y: 180 }, delay: 0.7, rotate: 5 },
  ];

  const users = [
    { icon: Code2, title: "Developers", description: "Understand and reduce technical debt" },
    { icon: BriefcaseBusiness, title: "Project Managers", description: "Make data-driven decisions" },
    { icon: GraduationCap, title: "Students", description: "Improve project quality" },
    { icon: Users, title: "Teams", description: "Ensure scalable systems" },
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
          <div className="inline-block mb-4 px-4 py-2 bg-[#14a085]/10 border border-[#14a085]/30 rounded-full">
            <span className="text-[#14a085] text-sm" style={{ fontWeight: 500 }}>Integration</span>
          </div>
          <h2 className="text-4xl md:text-5xl mb-6 text-white" style={{ fontWeight: 700, lineHeight: 1.2 }}>
            Built For Everyone in<br />Software Development
          </h2>
          <p className="text-lg text-gray-400" style={{ fontWeight: 400 }}>
            Seamless integration with your favorite tools and workflows
          </p>
        </motion.div>

        <div className="relative h-96 mb-20">
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 1 }}
              className="w-64 h-64 rounded-full bg-gradient-to-b from-[#14a085]/20 to-transparent blur-[60px]"
            />

            {tools.map((tool, index) => (
              <motion.div
                key={index}
                className="absolute"
                initial={{ x: 0, y: -150, opacity: 0, scale: 0.3, rotate: 0 }}
                animate={
                  isInView
                    ? { x: tool.position.x, y: tool.position.y, opacity: 1, scale: 1, rotate: tool.rotate }
                    : {}
                }
                transition={{ duration: 1.4, delay: tool.delay, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <motion.div
                  className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/10 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                  animate={{
                    y: [0, -12, 0],
                    rotate: [tool.rotate, tool.rotate + 5, tool.rotate],
                  }}
                  transition={{
                    duration: 4 + Math.random() * 2,
                    repeat: Infinity,
                    delay: tool.delay,
                    ease: "easeInOut",
                  }}
                >
                  <tool.icon className="w-11 h-11 text-[#14a085]/70" strokeWidth={1.5} />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {users.map((user, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              className="group p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 transition-all duration-500 hover:border-[#14a085]/30 hover:bg-[#0d0d0d]"
            >
              <div className="mb-4 w-12 h-12 rounded-xl bg-[#14a085]/10 flex items-center justify-center group-hover:bg-[#14a085]/20 transition-all duration-300">
                <user.icon className="w-6 h-6 text-[#14a085]" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg mb-2 text-white" style={{ fontWeight: 600 }}>
                {user.title}
              </h3>
              <p className="text-gray-400 text-sm" style={{ lineHeight: 1.6, fontWeight: 400 }}>
                {user.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
