import { useState } from 'react'
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
}

const RoomCard = ({ room }: RoomCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(true)

  const handleImageError = () => {
    setImageLoaded(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="rating-stars">
        {'★'.repeat(Math.floor(rating))}
        {'☆'.repeat(5 - Math.floor(rating))}
        <span className="rating-number">({rating})</span>
      </div>
    )
  }

  return (
    <div className="room-card">
      <div className="room-image">
        {imageLoaded ? (
          <img 
            src={room.image} 
            alt={room.title}
            onError={handleImageError}
          />
        ) : (
          <div className="image-placeholder">
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
          📍 {room.address}
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

        <div className="room-actions">
          <button className="btn-detail">Xem chi tiết</button>
          <button className="btn-contact">Liên hệ</button>
        </div>
      </div>
    </div>
  )
}

export default RoomCard