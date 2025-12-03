import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './RoomCard.css'
import type { Room as ApiRoom } from '../../types'

// UI-friendly room type: extend API room with optional UI fields for backward compatibility
export type Room = ApiRoom & {
  // optional UI fields that may exist in a different API/schema
  title?: string
  address?: string
  image?: string
  amenities?: string[]
  rating?: number
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

  const renderStars = useCallback((rating?: number) => {
    if (rating === undefined || rating === null) {
      return <div className="rating-stars">Chưa có đánh giá</div>
    }

    const fullStars = Math.floor(Math.max(0, Math.min(5, rating)))
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

  // Hiển thị tối đa 3 tiện nghi (an toàn khi amenities có thể undefined)
  const displayedAmenities = showAmenities && Array.isArray(room.amenities)
    ? room.amenities.slice(0, 3)
    : []

  const displayImage =
    (room.image && room.image.length > 0 ? room.image : undefined) ??
    room.primaryPictureUrl ??
    room.pictures?.find((pic) => pic.isPrimary)?.pictureUrl ??
    room.pictures?.[0]?.pictureUrl ??
    ''

  return (
    <div className="room-card">
      <div className="room-image">
        {imageLoaded && displayImage ? (
          <img 
            src={displayImage}
            alt={room.title ?? room.roomNumber ?? 'Phòng'}
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
          <h3 className="room-title">{room.title ?? room.roomNumber ?? 'Phòng'}</h3>
          <div className="room-price">
            {formatPrice(room.price)} VNĐ
            <span className="price-unit">/tháng</span>
          </div>
        </div>

        <div className="room-address">
          <span aria-hidden="true">📍</span>
          {room.address ?? ''}
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
              {Array.isArray(room.amenities) && room.amenities.length > 3 && (
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