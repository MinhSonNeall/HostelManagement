import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Room } from '../../components/RoomCard/RoomCard'
import './RoomDetail.css'
import { roomApi } from '../../api/rooms'
import { bookingApi } from '../../api/bookings'
import { reviewApi, Review } from '../../api/reviews'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'

const RoomDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showNotification } = useNotification()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [booking, setBooking] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [hasBooked, setHasBooked] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: '',
  })
  const [submittingReview, setSubmittingReview] = useState(false)

  // Memoized room images để tránh recalculate mỗi lần render
  const roomImages = useMemo(() => {
    if (room?.pictures && room.pictures.length > 0) {
      return room.pictures.map((pic) => pic.pictureUrl)
    }
    if (room?.primaryPictureUrl) {
      return [room.primaryPictureUrl]
    }
    if (room?.image) {
      return [room.image]
    }
    // Không có ảnh thì trả về mảng rỗng, sẽ hiển thị placeholder
    return []
  }, [room?.pictures, room?.primaryPictureUrl, room?.image])

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
  }, [])

  // Load reviews
  useEffect(() => {
    if (!id) return
    const loadReviews = async () => {
      try {
        setLoadingReviews(true)
        const roomReviews = await reviewApi.getByRoomId(parseInt(id))
        setReviews(roomReviews)
      } catch (error) {
        console.error('Error loading reviews:', error)
      } finally {
        setLoadingReviews(false)
      }
    }
    loadReviews()
  }, [id])

  // Check if user has booked this room
  useEffect(() => {
    if (!user || !id) {
      setHasBooked(false)
      return
    }
    const checkBooking = async () => {
      try {
        const customerBookings = await bookingApi.getByCustomerId(parseInt(user.id))
        const hasBookedThisRoom = customerBookings.some(
          (b) => b.roomId === parseInt(id) && b.bookingStatus === 'CONFIRMED'
        )
        setHasBooked(hasBookedThisRoom)
      } catch (error) {
        console.error('Error checking booking:', error)
        setHasBooked(false)
      }
    }
    checkBooking()
  }, [user, id])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    roomApi.getById(id)
      .then((apiRoom: any) => {
        const mapped: Room = {
          ...apiRoom,
          title: apiRoom.title ?? (apiRoom.roomNumber ? `Phòng ${apiRoom.roomNumber}` : apiRoom.description ?? ''),
          image: apiRoom.image ?? apiRoom.primaryPictureUrl ?? '',
          amenities: apiRoom.amenities ?? [],
          // Rating sẽ được tính từ reviews thực tế, không dùng từ API
        }
        setRoom(mapped)
      })
      .catch(() => setRoom(null))
      .finally(() => setLoading(false))
  }, [id])

  // Optimized functions với useCallback
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }, [])

  // Calculate average rating from reviews
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    const avg = sum / reviews.length
    // Làm tròn về 1 chữ số sau dấu thập phân
    return parseFloat(avg.toFixed(1))
  }, [reviews])

  // Format date
  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }, [])

  // Handle submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !id || !reviewForm.comment.trim()) {
      showNotification('Vui lòng nhập đầy đủ thông tin', 'error')
      return
    }

    if (!isAuthenticated) {
      showNotification('Vui lòng đăng nhập để đánh giá', 'warning')
      navigate('/login', { state: { from: `/rooms/${id}` } })
      return
    }

    try {
      setSubmittingReview(true)
      const newReview = await reviewApi.create({
        roomId: parseInt(id),
        customerId: parseInt(user.id),
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      })
      
      setReviews([...reviews, newReview])
      setReviewForm({ rating: 5, comment: '' })
      setShowReviewForm(false)
      showNotification('Đánh giá của bạn đã được gửi!', 'success')
    } catch (error: any) {
      console.error('Error submitting review:', error)
      showNotification(error.response?.data?.message || 'Không thể gửi đánh giá', 'error')
    } finally {
      setSubmittingReview(false)
    }
  }

  // Convert room boolean fields to amenities array
  const getRoomAmenities = useCallback((room: Room | null): string[] => {
    if (!room) return []
    const amenities: string[] = []
    
    if (room.hasAirConditioner) amenities.push('Điều hòa')
    if (room.hasWaterHeater) amenities.push('Máy nước nóng')
    if (room.hasPrivateBathroom) amenities.push('WC riêng')
    if (room.hasKitchen) amenities.push('Bếp')
    if (room.allowPet) amenities.push('Cho phép nuôi thú cưng')
    if (room.wifiFee && room.wifiFee > 0) amenities.push('WiFi')
    if (room.parkingFee && room.parkingFee > 0) amenities.push('Chỗ đậu xe')
    
    return amenities
  }, [])

  // contact action will be implemented later

  const handleBookRoom = useCallback(async () => {
    if (!isAuthenticated || !user) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: `/rooms/${id}` } })
      return
    }
    
    if (!room || !id) {
      showNotification('Không tìm thấy thông tin phòng', 'error')
      return
    }

    if (room.status === 'OCCUPIED') {
      showNotification('Phòng đã được đặt', 'error')
      return
    }
    
    const confirmBooking = window.confirm(
      `Bạn có muốn đặt phòng "${room.title}" với giá ${formatPrice(room.price)} VNĐ/tháng không?`
    )
    
    if (!confirmBooking) return

    try {
      setBooking(true)
      const customerId = parseInt(user.id)
      const roomId = parseInt(id)
      
      // Tạo booking với startDate là ngày mai
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + 1)
      const startDateStr = startDate.toISOString().split('T')[0]

      const booking = await bookingApi.create({
        roomId,
        customerId,
        startDate: startDateStr,
        totalPrice: room.price,
        bookingStatus: 'PENDING',
      })

      console.log('Booking created successfully:', booking)

      if (!booking || !booking.bookingId) {
        throw new Error('Booking created but invalid response')
      }

      // Redirect đến trang thanh toán
      showNotification('Đã tạo đơn đặt phòng. Đang chuyển đến trang thanh toán...', 'success')
      setTimeout(() => {
        navigate(`/payment/${booking.bookingId}?amount=${room.price}`)
      }, 500)
    } catch (error: any) {
      console.error('Error creating booking:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response,
        data: error.response?.data,
      })
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Không thể tạo đơn đặt phòng. Vui lòng thử lại sau.'
      
      showNotification(errorMessage, 'error')
    } finally {
      setBooking(false)
    }
  }, [isAuthenticated, user, navigate, id, room, formatPrice, showNotification])

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === roomImages.length - 1 ? 0 : prev + 1
    )
  }, [roomImages.length])

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? roomImages.length - 1 : prev - 1
    )
  }, [roomImages.length])

  const handleThumbnailClick = useCallback((index: number) => {
    setCurrentImageIndex(index)
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải thông tin phòng...</p>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="not-found-container">
        <h2>Không tìm thấy phòng</h2>
        <p>Phòng bạn đang tìm kiếm không tồn tại.</p>
        <Link to="/rooms" className="back-link">← Quay lại danh sách phòng</Link>
      </div>
    )
  }

  return (
    <div className="room-detail">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span> / </span>
          <Link to="/rooms">Danh sách phòng</Link>
          <span> / </span>
          <span>Chi tiết phòng</span>
        </nav>

        <div className="room-detail-content">
          {/* Main Content */}
          <div className="room-main-content">
            {/* Room Images */}
            {roomImages.length > 0 ? (
              <div className="room-images">
                <div className="main-image">
                  <img 
                    src={roomImages[currentImageIndex]} 
                    alt={`${room.title} - Ảnh ${currentImageIndex + 1}`}
                    loading="lazy"
                  />
                  {roomImages.length > 1 && (
                    <>
                      <button 
                        className="nav-button prev" 
                        onClick={handlePrevImage}
                        aria-label="Ảnh trước"
                      >
                        ‹
                      </button>
                      <button 
                        className="nav-button next" 
                        onClick={handleNextImage}
                        aria-label="Ảnh tiếp theo"
                      >
                        ›
                      </button>
                      <div className="image-counter">
                        {currentImageIndex + 1} / {roomImages.length}
                      </div>
                    </>
                  )}
                </div>
                
                {roomImages.length > 1 && (
                  <div className="image-thumbnails">
                    {roomImages.map((img, index) => (
                      <img 
                        key={index}
                        src={img} 
                        alt={`${room.title} ${index + 1}`}
                        className={index === currentImageIndex ? 'active' : ''}
                        onClick={() => handleThumbnailClick(index)}
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="room-images">
                <div className="main-image" style={{
                  background: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '400px',
                  color: '#9ca3af',
                  fontSize: '1.2rem',
                  borderRadius: '12px',
                }}>
                  Chưa có ảnh
                </div>
              </div>
            )}

            {/* Room Info */}
            <div className="room-info">
              <h1>{room.title}</h1>
              
              <div className="room-price-large">
                {formatPrice(room.price)} VNĐ
                <span className="price-unit">/tháng</span>
              </div>

              <div className="room-meta">
                <div className="meta-item">
                  <span className="meta-icon" aria-hidden="true">📐</span>
                  <span className="meta-text">{room.area} m²</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon" aria-hidden="true">⭐</span>
                  <span className="meta-text">
                    {averageRating > 0 ? `${averageRating.toFixed(1)} / 5` : 'Chưa có đánh giá'}
                  </span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon" aria-hidden="true">📍</span>
                  <span className="meta-text">{room.address}</span>
                </div>
              </div>

              {/* Description */}
              <div className="description-section">
                <h3>Mô tả</h3>
                <p>{room.description}</p>
              </div>

              {/* Amenities */}
              <div className="amenities-section">
                <h3>Tiện nghi</h3>
                <div className="amenities-grid">
                    {(() => {
                      const amenities = getRoomAmenities(room)
                      // Also check if room.amenities exists (for backward compatibility)
                      const allAmenities = amenities.length > 0 
                        ? amenities 
                        : (Array.isArray(room.amenities) ? room.amenities : [])
                      
                      return allAmenities.length > 0 ? (
                        allAmenities.map((amenity, index) => (
                          <div key={index} className="amenity-item">
                            <span className="amenity-icon" aria-hidden="true">✓</span>
                            {amenity}
                          </div>
                        ))
                      ) : (
                        <div className="no-amenities">Chưa có tiện nghi</div>
                      )
                    })()}
                  </div>
              </div>

              {/* Reviews Section */}
              <div className="reviews-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>Đánh giá ({reviews.length})</h3>
                  {isAuthenticated ? (
                    <button 
                      onClick={() => setShowReviewForm(true)}
                      className="btn-rating"
                    >
                      ⭐ Đánh giá
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate('/login', { state: { from: `/rooms/${id}` } })}
                      className="btn-rating"
                      style={{ background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' }}
                    >
                      🔐 Đăng nhập để đánh giá
                    </button>
                  )}
                </div>

                <div className="reviews-summary">
                  <div className="reviews-score">
                    <span className="score-number">
                      {averageRating > 0 ? averageRating.toFixed(1) : 'Chưa có'}
                    </span>
                    <span className="score-stars">★★★★★</span>
                    <span className="score-label">
                      {averageRating >= 4.5 ? 'Rất tốt' : averageRating >= 3.5 ? 'Tốt' : averageRating >= 2.5 ? 'Khá' : averageRating > 0 ? 'Trung bình' : 'Chưa có đánh giá'}
                    </span>
                  </div>
                </div>

                {loadingReviews ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải đánh giá...</div>
                ) : reviews.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
                  </div>
                ) : (
                  <div className="reviews-list">
                    {reviews.map((review) => (
                      <div key={review.reviewId} className="review-item">
                        <div className="review-header">
                          <div className="review-avatar">
                            {(review.customerName || 'U')
                              .split(' ')
                              .map((part) => part[0])
                              .join('')
                              .slice(-2)
                              .toUpperCase()}
                          </div>
                          <div className="review-meta">
                            <div className="review-name">{review.customerName || 'Người dùng'}</div>
                            <div className="review-rating-date">
                              <span className="review-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span>
                              <span className="review-date">{formatDate(review.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        {review.comment && <p className="review-comment">{review.comment}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="room-sidebar">
            {/* Book Room Button */}
            <div className="booking-card">
              <button 
                className="book-button" 
                onClick={handleBookRoom}
                disabled={!room || room.status === 'OCCUPIED' || booking}
              >
                {!isAuthenticated 
                  ? '🔐 Đăng nhập để đặt phòng' 
                  : booking 
                    ? 'Đang xử lý...' 
                    : '📋 Đặt phòng ngay'}
              </button>
              {room && room.status === 'OCCUPIED' && (
                <p className="booking-note" style={{ textAlign: 'center', color: '#ef4444', marginTop: '8px', fontSize: '0.9rem' }}>
                  Phòng đã được đặt
                </p>
              )}
              {room && room.status !== 'OCCUPIED' && (
                <p className="booking-note" style={{ textAlign: 'center', color: '#6b7280', marginTop: '8px', fontSize: '0.85rem' }}>
                  Đặt phòng nhanh chóng và dễ dàng
                </p>
              )}
            </div>

            <div className="contact-card">
              <h3>Liên hệ chủ trọ</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon" aria-hidden="true">👤</span>
                  <div className="contact-details">
                    <strong>{room.ownerName || 'Chủ trọ'}</strong>
                    <span>Chủ nhà</span>
                  </div>
                </div>

                {room.ownerPhone && (
                  <div className="contact-item">
                    <span className="contact-icon" aria-hidden="true">📞</span>
                    <div className="contact-details">
                      <strong>
                        <a
                          href={`tel:${room.ownerPhone}`}
                          className="contact-link"
                          title="Gọi điện"
                        >
                          {room.ownerPhone}
                        </a>
                      </strong>
                      <span>Liên hệ bất cứ lúc nào</span>
                    </div>
                  </div>
                )}

                {room.ownerEmail && (
                  <div className="contact-item">
                    <span className="contact-icon" aria-hidden="true">✉️</span>
                    <div className="contact-details">
                      <strong>
                        <a
                          href={`mailto:${room.ownerEmail}`}
                          className="contact-link"
                          title="Gửi email"
                        >
                          {room.ownerEmail}
                        </a>
                      </strong>
                      <span>Phản hồi nhanh chóng</span>
                    </div>
                  </div>
                )}

                {!room.ownerPhone && !room.ownerEmail && (
                  <div className="contact-item">
                    <div className="contact-details">
                      <span>Chưa có thông tin liên hệ. Vui lòng bấm đặt phòng để chủ trọ liên hệ lại.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* <div className="action-card">
              <button className="btn-favorite">
                ❤️ Thêm vào yêu thích
              </button>
              <button className="btn-share">
                📤 Chia sẻ
              </button>
            </div> */}

            <div className="quick-info">
              <h4>Thông tin nhanh</h4>
              <div className="info-list">
                <div className="info-item">
                  <span>Diện tích:</span>
                  <strong>{room.area} m²</strong>
                </div>
                <div className="info-item">
                  <span>Giá:</span>
                  <strong>{formatPrice(room.price)} VNĐ/tháng</strong>
                </div>
                <div className="info-item">
                  <span>Đánh giá:</span>
                  <strong>
                    {averageRating > 0 ? `${averageRating.toFixed(1)} ⭐` : 'Chưa có đánh giá'}
                  </strong>
                </div>
                <div className="info-item">
                  <span>Trạng thái:</span>
                  <strong className={room.status === 'AVAILABLE' ? 'status-available' : room.status === 'OCCUPIED' ? 'status-occupied' : ''}>
                    {room.status === 'AVAILABLE' ? 'Còn phòng' : room.status === 'OCCUPIED' ? 'Đã được đặt' : room.status || 'Còn phòng'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showReviewForm && (
        <div className="rating-modal-overlay" onClick={() => {
          setShowReviewForm(false)
          setReviewForm({ rating: 5, comment: '' })
        }}>
          <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rating-modal-header">
              <h2>Đánh giá phòng trọ</h2>
              <button 
                className="rating-modal-close"
                onClick={() => {
                  setShowReviewForm(false)
                  setReviewForm({ rating: 5, comment: '' })
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitReview} className="rating-modal-form">
              <div className="rating-form-group">
                <label className="rating-label">Đánh giá của bạn</label>
                <div className="rating-stars-container">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`rating-star-btn ${star <= reviewForm.rating ? 'active' : ''}`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="rating-text">{reviewForm.rating} sao</span>
                </div>
              </div>
              <div className="rating-form-group">
                <label className="rating-label" htmlFor="review-comment">
                  Nhận xét của bạn
                </label>
                <textarea
                  id="review-comment"
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Chia sẻ trải nghiệm của bạn về phòng trọ này..."
                  required
                  rows={6}
                  className="rating-textarea"
                />
              </div>
              <div className="rating-modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false)
                    setReviewForm({ rating: 5, comment: '' })
                  }}
                  className="rating-btn-cancel"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || !reviewForm.comment.trim()}
                  className="rating-btn-submit"
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomDetail