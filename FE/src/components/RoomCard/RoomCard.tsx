import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './RoomCard.css'

export interface Room {
  id: number
  title: string
  price: number
  area: number
  address: string
  image: string
  amenities: string[]
  rating: number
  description?: string
}

interface RoomCardProps {
  room: Room
  showAmenities?: boolean
}

const RoomCard = ({ room, showAmenities = false }: RoomCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(true)
  const navigate = useNavigate()

  const handleImageError = useCallback(() => {
    setImageLoaded(false)
  }, [])

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }, [])

  const renderStars = useCallback((rating: number) => {
    const fullStars = Math.floor(rating)
    const emptyStars = 5 - fullStars
    
    return (
      <div className="rating-stars">
        {'★'.repeat(fullStars)}
        {'☆'.repeat(emptyStars)}
        <span className="rating-number">({rating})</span>
      </div>
    )
  }, [])

  const handleViewDetail = useCallback(() => {
    navigate(`/rooms/${room.id}`)
  }, [navigate, room.id])

  const handleContact = useCallback(() => {
    alert('Tính năng liên hệ sẽ được tích hợp sau!')
  }, [])

  // Hiển thị tối đa 3 tiện nghi
  const displayedAmenities = showAmenities 
    ? room.amenities.slice(0, 3)
    : []

  return (
    <div className="room-card">
      <div className="room-image">
        {imageLoaded ? (
          <img 
            src={room.image} 
            alt={room.title}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="image-placeholder" aria-label="Không thể tải ảnh">
            🏠
          </div>
        )}
        <div className="room-badge">Nổi bật</div>
      </div>

      <div className="room-content">
        <div className="room-header">
          <h3 className="room-title">{room.title}</h3>
          <div className="room-price">
            {formatPrice(room.price)} VNĐ
            <span className="price-unit">/tháng</span>
          </div>
        </div>

        <div className="room-address">
          <span aria-hidden="true">📍</span>
          {room.address}
        </div>

        <div className="room-specs">
          <div className="spec-item">
            <span className="spec-label">Diện tích:</span>
            <span className="spec-value">{room.area}m²</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Đánh giá:</span>
            <span className="spec-value">{renderStars(room.rating)}</span>
          </div>
        </div>

        {showAmenities && displayedAmenities.length > 0 && (
          <div className="room-amenities">
            <div className="amenities-label">Tiện nghi:</div>
            <div className="amenities-list">
              {displayedAmenities.map((amenity, index) => (
                <span key={index} className="amenity-tag">
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 3 && (
                <span className="amenity-tag">
                  +{room.amenities.length - 3} khác
                </span>
              )}
            </div>
          </div>
        )}

        <div className="room-actions">
          <button 
            className="btn-detail" 
            onClick={handleViewDetail}
          >
            Xem chi tiết
          </button>
          <button 
            className="btn-contact" 
            onClick={handleContact}
          >
            Liên hệ
          </button>
        </div>
      </div>
    </div>
  )
}

export default RoomCard