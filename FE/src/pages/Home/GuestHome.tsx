// pages/GuestHome/GuestHome.tsx (cập nhật)
import { useState } from 'react'
import SearchBar from '../../components/SearchBar/SearchBar'
import RoomCard, { Room } from '../../components/RoomCard/RoomCard'
import './GuestHome.css'
import { Link } from 'react-router-dom'

// Mock data - cập nhật thêm description
const mockRooms: Room[] = [
  {
    id: 1,
    title: 'Phòng trọ cao cấp',
    price: 3000000,
    area: 25,
    address: '123 Kim Mã, Ba Đình, TP.HN',
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400',
    amenities: ['Wifi', 'Máy lạnh', 'Chỗ để xe', 'Bảo vệ'],
    rating: 4.5,
    description: 'Phòng trọ mới xây, view thành phố, gần trung tâm'
  },
  {
    id: 2,
    title: 'Chung cư mini',
    price: 2500000,
    area: 20,
    address: ', Cầu Giấy, TP.HN',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400',
    amenities: ['Wifi', 'Bảo vệ', 'Thang máy', 'Máy giặt'],
    rating: 4.2,
    description: 'Chung cư mini mới, an ninh tốt, tiện nghi đầy đủ'
  },
]

const GuestHome = () => {
  const [featuredRooms] = useState<Room[]>(mockRooms)

  return (
    <div className="guest-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Tìm Ngôi Nhà Phù Hợp Với Bạn</h1>
          <p>Khám phá hàng ngàn phòng trọ, chung cư với giá tốt nhất</p>
          <SearchBar />
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="featured-rooms">
        <div className="container">
          <h2>Phòng Trọ Nổi Bật</h2>
          <p className="section-subtitle">Những phòng trọ được đánh giá cao nhất</p>

          <div className="rooms-grid">
            {featuredRooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
              />
            ))}
          </div>

          <div className="view-all-container">
            <Link to="/roomlist" className="view-all-btn" role="button">
              Xem Tất Cả Phòng
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default GuestHome