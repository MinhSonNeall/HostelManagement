import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, type AdminReview } from '../../api/admin'
import { useNotification } from '../../contexts/NotificationContext'
import './AdminReviews.css'

const AdminReviews = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getAllReviews()
      setReviews(data)
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách đánh giá:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/login')
      } else {
        showNotification('Lỗi khi tải danh sách đánh giá', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      return
    }

    try {
      await adminApi.deleteReview(reviewId)
      showNotification('Xóa đánh giá thành công', 'success')
      loadReviews()
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Lỗi khi xóa đánh giá', 'error')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const getRatingStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  if (loading) {
    return (
      <div className="admin-reviews-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  }

  return (
    <div className="admin-reviews">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
          ← Quay lại
        </button>
        <h1>Quản lý đánh giá</h1>
      </div>

      <div className="reviews-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ID Phòng</th>
              <th>ID Khách hàng</th>
              <th>Đánh giá</th>
              <th>Bình luận</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.reviewId}>
                <td>{review.reviewId}</td>
                <td>{review.roomId}</td>
                <td>{review.customerId}</td>
                <td>
                  <span className="rating">{getRatingStars(review.rating)}</span>
                  <span className="rating-number">({review.rating}/5)</span>
                </td>
                <td className="comment-cell">
                  {review.comment || '-'}
                </td>
                <td>{formatDate(review.createdAt)}</td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(review.reviewId)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {reviews.length === 0 && (
          <p className="empty-state">Chưa có đánh giá nào</p>
        )}
      </div>
    </div>
  )
}

export default AdminReviews

