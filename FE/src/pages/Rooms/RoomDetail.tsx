import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Room } from '../../components/RoomCard/RoomCard'
import './RoomDetail.css'
import { roomApi } from '../../api/rooms'

const RoomDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [room, setRoom] = useState<Room | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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
    return ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']
  }, [room?.pictures, room?.primaryPictureUrl, room?.image])

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
          rating: apiRoom.rating ?? 0,
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

  // contact action will be implemented later

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
                    {Array.isArray(room.amenities) && room.amenities.length > 0 ? (
                      room.amenities.map((amenity, index) => (
                        <div key={index} className="amenity-item">
                          <span className="amenity-icon" aria-hidden="true">✓</span>
                          {amenity}
                        </div>
                      ))
                    ) : (
                      <div className="no-amenities">Chưa có tiện nghi</div>
                    )}
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