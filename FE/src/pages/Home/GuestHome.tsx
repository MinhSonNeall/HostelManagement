// pages/GuestHome/GuestHome.tsx
import { useState, useCallback, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import SearchBar, { SearchFilters } from '../../components/SearchBar/SearchBar'
import RoomCard, { Room as UiRoom } from '../../components/RoomCard/RoomCard'
import './GuestHome.css'
import { roomApi } from '../../api/rooms'
import { reviewApi } from '../../api/reviews'

const GuestHome = () => {
  const [featuredRooms, setFeaturedRooms] = useState<UiRoom[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const loadRoomsWithRatings = async () => {
      setLoading(true)
      try {
        // Load rooms
        const apiRooms = await roomApi.getAll()
        
        // Map rooms
        const mapped: UiRoom[] = apiRooms.map((r: any) => ({
          ...r,
          title: r.title ?? (r.roomNumber ? `Phòng ${r.roomNumber}` : r.description ?? ''),
          address: r.address ?? '',
          image: r.image ?? r.primaryPictureUrl ?? '',
          amenities: r.amenities ?? [],
          // Rating sẽ được tính từ reviews
        }))

        // Load reviews và tính average rating cho mỗi room
        const roomsWithRatings = await Promise.all(
          mapped.slice(0, 6).map(async (room) => {
            try {
              const reviews = await reviewApi.getByRoomId(room.roomId || parseInt(room.id))
              if (reviews.length > 0) {
                const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                // Làm tròn về 1 chữ số sau dấu thập phân
                return { ...room, rating: parseFloat(avgRating.toFixed(1)) }
              }
              return { ...room, rating: 0 }
            } catch (err) {
              console.error(`Error loading reviews for room ${room.roomId}:`, err)
              return { ...room, rating: 0 }
            }
          })
        )

        setFeaturedRooms(roomsWithRatings)
      } catch (err: any) {
        setError(err?.message ?? 'Lỗi khi tải phòng')
      } finally {
        setLoading(false)
      }
    }

    loadRoomsWithRatings()
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