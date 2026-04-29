import { motion } from "motion/react";
import { FaEnvelope, FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import Frame from "../imports/Frame1/Frame1";

export function FooterSection() {
  const footerLinks = {
    Product: ["Features", "Pricing", "Security", "Roadmap"],
    Company: ["About", "Blog", "Careers", "Contact"],
    Resources: ["Documentation", "API Reference", "Tutorials", "Community"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  };

  const socialLinks = [
    { icon: FaGithub, href: "#" },
    { icon: FaTwitter, href: "#" },
    { icon: FaLinkedin, href: "#" },
    { icon: FaEnvelope, href: "#" },
  ];

  return (
    <footer id="footer" className="relative py-20 px-6 overflow-hidden bg-black border-t border-white/5">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-6 gap-12 mb-16">
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4 h-[30px]">
                <Frame />
              </div>
              <p className="text-gray-400 mb-6 text-sm" style={{ lineHeight: 1.7, fontWeight: 400 }}>
                Turning Metrics Into Decisions. AI-powered software risk prediction and explainable insights for modern development teams.
              </p>
              <div className="flex items-center gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#14a085]/20 hover:border-[#14a085]/30 transition-all duration-300"
                  >
                    <social.icon className="w-5 h-5 text-gray-400 hover:text-[#14a085] transition-colors" />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <h4 className="text-white mb-4 text-sm" style={{ fontWeight: 600 }}>
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-[#14a085] transition-colors duration-300 text-sm"
                      style={{ fontWeight: 400 }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-400 text-sm" style={{ fontWeight: 400 }}>
            © 2026 Veracity. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-[#14a085] transition-colors text-sm" style={{ fontWeight: 400 }}>
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-[#14a085] transition-colors text-sm" style={{ fontWeight: 400 }}>
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-[#14a085] transition-colors text-sm" style={{ fontWeight: 400 }}>
              Cookies
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
