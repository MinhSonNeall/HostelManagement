import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { paymentApi, PaymentQRResponse } from '../../api/payments'
import { useNotification } from '../../contexts/NotificationContext'
import './Payment.css'

const Payment = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [qrData, setQrData] = useState<PaymentQRResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [paid, setPaid] = useState(false)

  useEffect(() => {
    const loadQRCode = async () => {
      if (!bookingId) {
        showNotification('Không tìm thấy thông tin đặt phòng', 'error')
        navigate('/')
        return
      }

      try {
        setLoading(true)
        // Lấy amount từ URL params hoặc từ booking
        const urlParams = new URLSearchParams(window.location.search)
        const amount = parseFloat(urlParams.get('amount') || '0')

        if (amount <= 0) {
          showNotification('Số tiền thanh toán không hợp lệ', 'error')
          navigate('/')
          return
        }

        const data = await paymentApi.generateQR(parseInt(bookingId), amount)
        setQrData(data)
      } catch (error: any) {
        console.error('Error loading QR code:', error)
        showNotification(error.response?.data?.message || 'Không thể tạo mã QR thanh toán', 'error')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    loadQRCode()
  }, [bookingId, navigate, showNotification])

  const handleCheckPayment = async () => {
    if (!qrData) return

    try {
      setChecking(true)
      const result = await paymentApi.checkPayment(
        qrData.bookingId,
        qrData.code,
        qrData.amount
      )

      if (result.paid) {
        setPaid(true)
        showNotification('Thanh toán thành công!', 'success')
        setTimeout(() => {
          navigate('/')
        }, 2000)
      } else {
        showNotification('Chưa nhận được thanh toán. Vui lòng thử lại sau.', 'info')
      }
    } catch (error: any) {
      console.error('Error checking payment:', error)
      showNotification(error.response?.data?.message || 'Không thể kiểm tra thanh toán', 'error')
    } finally {
      setChecking(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  if (loading) {
    return (
      <div className="payment-container">
        <div className="payment-loading">
          <div className="spinner"></div>
          <p>Đang tạo mã QR thanh toán...</p>
        </div>
      </div>
    )
  }

  if (!qrData) {
    return (
      <div className="payment-container">
        <div className="payment-error">
          <h2>Không thể tạo mã QR thanh toán</h2>
          <button onClick={() => navigate('/')} className="btn-back">
            Quay lại trang chủ
          </button>
        </div>
      </div>
    )
  }

  if (paid) {
    return (
      <div className="payment-container">
        <div className="payment-success">
          <div className="success-icon">✓</div>
          <h2>Thanh toán thành công!</h2>
          <p>Đơn đặt phòng của bạn đã được xác nhận.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Về trang chủ
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-container">
      <div className="payment-content">
        <h1>Thanh toán qua VietQR</h1>
        
        <div className="payment-info">
          <div className="info-item">
            <span className="info-label">Mã đặt phòng:</span>
            <span className="info-value">#{qrData.bookingId}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Số tiền:</span>
            <span className="info-value amount">{formatPrice(qrData.amount)} VNĐ</span>
          </div>
          <div className="info-item">
            <span className="info-label">Mã xác nhận:</span>
            <span className="info-value code">{qrData.code}</span>
          </div>
        </div>

        <div className="qr-section">
          <h3>Quét mã QR để thanh toán</h3>
          <div className="qr-code-container">
            <img src={qrData.qrUrl} alt="QR Code" className="qr-code" />
          </div>
          <p className="qr-instruction">
            Mở ứng dụng ngân hàng trên điện thoại và quét mã QR để thanh toán
          </p>
        </div>

        <div className="payment-actions">
          <button
            onClick={handleCheckPayment}
            disabled={checking}
            className="btn-check-payment"
          >
            {checking ? 'Đang kiểm tra...' : 'Tôi đã thanh toán'}
          </button>
          <button onClick={() => navigate('/')} className="btn-cancel">
            Hủy
          </button>
        </div>

        <div className="payment-note">
          <p><strong>Lưu ý:</strong></p>
          <ul>
            <li>Vui lòng thanh toán đúng số tiền: <strong>{formatPrice(qrData.amount)} VNĐ</strong></li>
            <li>Nội dung chuyển khoản sẽ chứa mã: <strong>{qrData.code}</strong></li>
            <li>Sau khi thanh toán, vui lòng nhấn nút "Tôi đã thanh toán" để xác nhận</li>
            <li>Hệ thống sẽ tự động kiểm tra và cập nhật trạng thái đặt phòng</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Payment

