import apiClient from './api'

export interface PaymentCreateResponse {
  checkout_url: string
  session_id: string
}

export interface PaymentStatusResponse {
  status?: 'success' | 'failed' | 'pending'
  tier: 'free' | 'pro'
  is_pro?: boolean
  message?: string
}

/**
 * Create a new PayFast payment session
 */
export const createPaymentSession = async (plan: 'pro'): Promise<PaymentCreateResponse> => {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const response = await apiClient.post<PaymentCreateResponse>('/payment/create', { 
      plan,
      return_url: 'https://veracity-delta.vercel.app/payment/success',
      cancel_url: 'https://veracity-delta.vercel.app/payment/cancel'
    })
    return response.data
  } catch (error) {
    console.error('Error creating payment session:', error)
    throw error
  }
}

/**
 * Check the status of a payment and update user tier
 */
export const getPaymentStatus = async (): Promise<PaymentStatusResponse> => {
  try {
    const response = await apiClient.get<PaymentStatusResponse>('/payment/status')
    return response.data
  } catch (error) {
    console.error('Error fetching payment status:', error)
    throw error
  }
}

const paymentService = {
  createPaymentSession,
  getPaymentStatus,
}

export default paymentService
