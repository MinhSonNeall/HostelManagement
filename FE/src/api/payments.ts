import apiClient from './axios'

export interface PaymentQRResponse {
  qrUrl: string
  bookingId: number
  amount: number
  code: number
}

export interface PaymentCheckResponse {
  paid: boolean
  bookingId: number
  message: string
}

export const paymentApi = {
  // Tạo QR code thanh toán
  generateQR: async (bookingId: number, amount: number): Promise<PaymentQRResponse> => {
    const response = await apiClient.get('/payments/qr', {
      params: { bookingId, amount },
    })
    return response.data as PaymentQRResponse
  },

  // Kiểm tra trạng thái thanh toán
  checkPayment: async (bookingId: number, code: number, amount: number): Promise<PaymentCheckResponse> => {
    const response = await apiClient.get('/payments/check', {
      params: { bookingId, code, amount },
    })
    return response.data as PaymentCheckResponse
  },
}

