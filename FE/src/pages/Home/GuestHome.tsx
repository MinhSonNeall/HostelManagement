// pages/GuestHome/GuestHome.tsx
import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchBar, { SearchFilters } from '../../components/SearchBar/SearchBar'
import RoomCard, { Room as UiRoom } from '../../components/RoomCard/RoomCard'
import './GuestHome.css'
import { Link } from 'react-router-dom'
import { roomApi } from '../../api/rooms'
import { useEffect } from 'react'

const GuestHome = () => {
  const [featuredRooms, setFeaturedRooms] = useState<UiRoom[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    roomApi.getAll()
      .then((apiRooms) => {
        // Map API rooms to UI-friendly rooms (provide safe defaults)
        const mapped: UiRoom[] = apiRooms.map((r: any) => ({
          ...r,
          title: r.title ?? (r.roomNumber ? `Phòng ${r.roomNumber}` : r.description ?? ''),
          address: r.address ?? '',
          image: r.image ?? r.primaryPictureUrl ?? '',
          amenities: r.amenities ?? [],
          rating: r.rating ?? 0,
        }))
        setFeaturedRooms(mapped)
      })
      .catch((err) => {
        setError(err?.message ?? 'Lỗi khi tải phòng')
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSearch = useCallback((filters: SearchFilters) => {
    // Chuyển hướng đến RoomList với filters
    navigate('/roomlist', { 
      state: { filters },
      replace: true 
    })
  }, [navigate])

  return (
    <div className="guest-home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Tìm Ngôi Nhà Phù Hợp Với Bạn</h1>
          <p>Khám phá hàng ngàn phòng trọ, chung cư với giá tốt nhất</p>
          <SearchBar 
            onSearch={handleSearch}
            className="home-searchbar"
          />
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="featured-rooms">
        <div className="container">
          <h2>Phòng Trọ Nổi Bật</h2>
          <p className="section-subtitle">Những phòng trọ được đánh giá cao nhất</p>

          <div className="rooms-grid">
            {loading && <div>Đang tải phòng...</div>}
            {error && <div className="error">{error}</div>}
            {!loading && !error && featuredRooms.length === 0 && (
              <div className="no-results">Không có phòng nào</div>
            )}
            {!loading && !error && featuredRooms.map(room => (
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