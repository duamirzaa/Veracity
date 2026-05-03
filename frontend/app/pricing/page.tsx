'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createPaymentSession } from '@/services/payment'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { FaCheck, FaCrown, FaRocket, FaUserGraduate } from 'react-icons/fa'
import { motion } from 'framer-motion'

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/pricing')
      return
    }

    try {
      setLoading(true)
      const { checkout_url } = await createPaymentSession('pro')
      window.location.href = checkout_url
    } catch (error) {
      alert('Failed to initiate payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const plans = [
    {
      name: 'Student',
      icon: <FaUserGraduate className="text-blue-400" />,
      price: 'Free',
      description: 'Ideal for learning and academic projects',
      features: [
        '5 project creation limit',
        'Basic SHAP explanations',
        'Email support',
        'Community access',
        'Free PDF reports'
      ],
      cta: 'Current Plan',
      active: user?.role === 'student',
      disabled: true
    },
    {
      name: 'Free',
      icon: <FaRocket className="text-primary-400" />,
      price: '$0',
      description: 'Great for getting started with defect prediction',
      features: [
        '5 project creation limit',
        'Basic SHAP explanations',
        'Community support',
        'JSON/XML reports'
      ],
      cta: 'Current Plan',
      active: user?.tier === 'free' && user?.role !== 'student',
      disabled: true
    },
    {
      name: 'Pro',
      icon: <FaCrown className="text-yellow-400" />,
      price: '$29',
      period: '/month',
      description: 'Advanced features for professional developers',
      features: [
        'Unlimited code analyses',
        'Detailed PDF reports',
        'Priority AI support',
        'Full analytics dashboard',
        'API access',
        'Dynamic mitigation strategies'
      ],
      cta: 'Upgrade to Pro',
      popular: true,
      active: user?.tier === 'pro'
    }
  ]

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Unlock the full potential of Vera — AI with our Pro tier. Get unlimited analyses, premium reports, and priority support.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-dark-800 rounded-2xl p-8 border ${
                plan.popular ? 'border-primary-500 shadow-lg shadow-primary-500/10' : 'border-dark-700'
              } flex flex-col`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <div className="text-3xl mb-4">{plan.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-gray-400">{plan.period}</span>}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{plan.description}</p>
              </div>

              <div className="flex-grow">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                      <FaCheck className="text-primary-500 mt-1 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={plan.name === 'Pro' ? handleUpgrade : undefined}
                disabled={plan.disabled || plan.active || loading}
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  plan.active
                    ? 'bg-dark-700 text-gray-400 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                    : 'bg-dark-700 hover:bg-dark-600 text-white border border-dark-600'
                } ${loading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {plan.active ? 'Current Plan' : loading && plan.name === 'Pro' ? 'Processing...' : plan.cta}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 bg-dark-800/50 rounded-2xl p-8 border border-dark-700 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Have questions about our plans?</h3>
          <p className="text-gray-400 mb-6">Contact our support team for custom enterprise solutions or academic discounts.</p>
          <button 
            onClick={() => router.push('/dashboard/chatbot')}
            className="text-primary-400 font-semibold hover:text-primary-300 underline underline-offset-4"
          >
            Chat with Vera Assistant
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
