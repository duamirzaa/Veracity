'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { FaCheckCircle, FaSpinner, FaRocket } from 'react-icons/fa'
import { getPaymentStatus } from '@/services/payment'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'

export const dynamic = 'force-dynamic'

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const { refreshUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const result = await getPaymentStatus()
        if (result.tier === 'pro' || result.is_pro === true || (result as any).status === 'success') {
          await refreshUser()
          setStatus('success')
        } else {
          setStatus('error')
        }
      } catch (error) {
        setStatus('error')
      }
    }
    verifyPayment()
  }, [refreshUser])

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {status === 'verifying' && (
          <div className="space-y-6">
            <FaSpinner className="text-primary-500 text-6xl animate-spin mx-auto" />
            <h1 className="text-3xl font-bold text-white">Verifying Payment...</h1>
            <p className="text-gray-400">Please wait while we confirm your subscription update.</p>
          </div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 bg-dark-800 p-12 rounded-3xl border border-primary-500/30 shadow-2xl shadow-primary-500/10"
          >
            <FaCheckCircle className="text-primary-500 text-8xl mx-auto" />
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white">Upgrade Successful!</h1>
              <p className="text-gray-400 text-lg">
                Welcome to <span className="text-primary-400 font-bold">Veracity Pro</span>. 
                Premium features are now unlocked.
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-6 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold transition-all"
            >
              Go to Dashboard
            </button>
          </motion.div>
        )}

        {status === 'error' && (
          <div className="space-y-6 bg-dark-800 p-12 rounded-3xl border border-red-500/30">
            <h1 className="text-3xl font-bold text-white text-red-400">Verification Failed</h1>
            <p className="text-gray-400">We couldn't verify your payment. Please try refreshing.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-red-500 text-white rounded-xl font-bold"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
