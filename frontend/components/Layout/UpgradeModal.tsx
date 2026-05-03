'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { FaCrown, FaTimes, FaRocket } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-dark-800 border border-primary-500/30 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header Image/Pattern */}
          <div className="h-32 bg-gradient-to-br from-primary-600 to-primary-400 relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            </div>
            <div className="relative bg-white/20 p-4 rounded-full backdrop-blur-md">
              <FaCrown className="text-4xl text-white drop-shadow-lg" />
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Upgrade Required</h2>
            <p className="text-gray-400 mb-8">
              This feature is exclusive to our Pro Plan. Upgrade now to unlock full access to advanced AI analysis, detailed PDF reports, and more.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  onClose()
                  router.push('/pricing')
                }}
                className="w-full bg-primary-500 hover:bg-primary-600 text-dark-900 font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 group"
              >
                <FaRocket className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                Upgrade Now
              </button>
              <button
                onClick={onClose}
                className="w-full bg-dark-700 hover:bg-dark-600 text-white font-medium py-3 rounded-xl transition-all"
              >
                Maybe Later
              </button>
            </div>

            <p className="mt-6 text-xs text-gray-500">
              Join 5,000+ developers getting better insights with Pro.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
