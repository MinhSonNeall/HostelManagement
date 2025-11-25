import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Room } from '../../components/RoomCard/RoomCard'
import './RoomDetail.css'

const mockRoomDetail: Room[] = [
  {
    id: 1,
    title: 'Phòng trọ cao cấp',
    price: 3000000,
    area: 25,
    address: '123 Kim Mã, Ba Đình, TP.HN',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    amenities: ['Wifi', 'Máy lạnh', 'Chỗ để xe', 'Bảo vệ', 'Camera', 'Tủ lạnh'],
    rating: 4.5,
    description: 'Phòng trọ mới xây, view thành phố, gần trung tâm. Phòng được trang bị đầy đủ tiện nghi, nội thất cao cấp, an ninh tốt. Vị trí thuận tiện di chuyển đến các quận trung tâm, gần chợ, siêu thị, trường học.'
  },
  {
    id: 2,
    title: 'Chung cư mini',
    price: 2500000,
    area: 20,
    address: 'Cầu Giấy, TP.HN',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
    amenities: ['Wifi', 'Bảo vệ', 'Thang máy', 'Máy giặt', 'Pinh', 'Gác lửng'],
    rating: 4.2,
    description: 'Chung cư mini mới, an ninh tốt, tiện nghi đầy đủ. Khu vực yên tĩnh, phù hợp cho sinh viên và người đi làm. Có chỗ để xe rộng rãi, gần công viên, khu vui chơi.'
  }
]

const RoomDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Memoized room images để tránh recalculate mỗi lần render
  const roomImages = useMemo(() => [
    room?.image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'
  ], [room?.image])

  useEffect(() => {
    const fetchRoomDetail = () => {
      setLoading(true)
      setTimeout(() => {
        const foundRoom = mockRoomDetail.find(room => room.id === parseInt(id || '0'))
        setRoom(foundRoom || null)
        setLoading(false)
      }, 500)
    }

    fetchRoomDetail()
  }, [id])

  // Optimized functions với useCallback
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }, [])

  const handleContact = useCallback(() => {
    alert('Tính năng liên hệ sẽ được tích hợp sau!')
  }, [])

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

  const handleBooking = useCallback(() => {
    alert('Tính năng đặt phòng sẽ được cập nhật sớm!')
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
            <div className="room-images">
              <div className="main-image">
                <img 
                  src={roomImages[currentImageIndex]} 
                  alt={`${room.title} - Ảnh ${currentImageIndex + 1}`}
                  loading="lazy"
                />
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
              </div>
              
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
            </div>

            {/* Room Info */}
            <div className="room-info">
              <h1>{room.title}</h1>
              <button className="book-button" onClick={handleBooking}>
                Đặt phòng ngay
              </button>
              
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
                  <span className="meta-text">{room.rating} / 5</span>
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
                  {room.amenities.map((amenity, index) => (
                    <div key={index} className="amenity-item">
                      <span className="amenity-icon" aria-hidden="true">✓</span>
                      {amenity}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="room-sidebar">
            <div className="contact-card">
              <h3>Liên hệ chủ trọ</h3>
              
              <div className="contact-info">
                <div className="contact-item">
                  <span className="contact-icon" aria-hidden="true">👤</span>
                  <div className="contact-details">
                    <strong>Anh Trường</strong>
                    <span>Chủ nhà</span>
                  </div>
                </div>
                
                <div className="contact-item">
                  <span className="contact-icon" aria-hidden="true">📞</span>
                  <div className="contact-details">
                    <strong>0123 456 789</strong>
                    <span>8:00 - 22:00 hàng ngày</span>
                  </div>
                </div>
                
                <div className="contact-item">
                  <span className="contact-icon" aria-hidden="true">✉️</span>
                  <div className="contact-details">
                    <strong>truong@example.com</strong>
                    <span>Phản hồi trong 2 giờ</span>
                  </div>
                </div>
              </div>

              {/* <button className="btn-contact-primary" onClick={handleContact}>
                📞 Gọi ngay
              </button>
              <button className="btn-contact-secondary" onClick={handleContact}>
                💬 Nhắn tin Zalo
              </button> */}
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
                  <strong>{room.rating} ⭐</strong>
                </div>
                <div className="info-item">
                  <span>Trạng thái:</span>
                  <strong className="status-available">Còn phòng</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoomDetail