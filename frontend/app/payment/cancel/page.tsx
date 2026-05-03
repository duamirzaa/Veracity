'use client'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { FaTimesCircle, FaArrowLeft, FaComments } from 'react-icons/fa'
import { motion } from 'framer-motion'

export const dynamic = 'force-dynamic'

export default function PaymentCancelPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 bg-dark-800 p-12 rounded-3xl border border-red-500/20"
        >
          <FaTimesCircle className="text-red-500 text-8xl mx-auto" />
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-white">Payment Cancelled</h1>
            <p className="text-gray-400 text-lg text-gray-400">
              The payment process was cancelled. You have not been charged.
            </p>
          </div>
          <button
            onClick={() => router.push('/pricing')}
            className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
          >
            <FaArrowLeft />
            Try Again
          </button>
        </motion.div>
      </div>
    </div>
  )
}
