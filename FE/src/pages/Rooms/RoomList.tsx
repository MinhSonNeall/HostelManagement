import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import RoomCard, { Room as UiRoom } from '../../components/RoomCard/RoomCard'
import SearchBar, { SearchFilters } from '../../components/SearchBar/SearchBar'
import './RoomList.css'
import { roomApi } from '../../api/rooms'

const RoomList = () => {
    const [rooms, setRooms] = useState<UiRoom[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const location = useLocation() // Sử dụng useLocation

    // Nhận filters từ navigation state nếu có
    const initialFiltersFromNav = location.state?.filters as SearchFilters | undefined

    const [filters, setFilters] = useState<SearchFilters>({
        location: '',
        priceRange: { min: 0, max: 10000000 },
        area: { min: 0, max: 100 },
        amenities: [],
        ...initialFiltersFromNav
    })

    // Filter rooms based on criteria
    const filteredRooms = useMemo(() => {
        return rooms.filter(room => {
            const title = (room.title ?? '').toLowerCase()
            const address = (room.address ?? '').toLowerCase()
            const query = filters.location.toLowerCase()
            const matchesSearch = filters.location === '' || title.includes(query) || address.includes(query)

            const matchesPrice = (room.price ?? 0) >= filters.priceRange.min &&
                (room.price ?? 0) <= filters.priceRange.max

            const matchesArea = (room.area ?? 0) >= filters.area.min &&
                (room.area ?? 0) <= filters.area.max

            return matchesSearch && matchesPrice && matchesArea
        })
    }, [rooms, filters])

    const handleSearch = useCallback((searchFilters: SearchFilters) => {
        setFilters(searchFilters)
    }, [])

    useEffect(() => {
        const fetchRooms = async () => {
            setLoading(true)
            setError(null)
            try {
                const apiRooms = await roomApi.getAll()
                const mapped: UiRoom[] = apiRooms.map((r: any) => ({
                    ...r,
                    title: r.title ?? (r.roomNumber ? `Phòng ${r.roomNumber}` : r.description ?? ''),
                    address: r.address ?? '',
                    image: r.image ?? '',
                    amenities: r.amenities ?? [],
                    rating: r.rating ?? 0,
                }))
                setRooms(mapped)
            } catch (err: any) {
                console.error('Failed to fetch rooms:', err)
                setError(err?.message ?? 'Lỗi khi tải danh sách phòng')
            } finally {
                setLoading(false)
            }
        }

        fetchRooms()
    }, [])

    // Cập nhật filters khi nhận từ navigation
    useEffect(() => {
        if (initialFiltersFromNav) {
            setFilters(prev => ({ ...prev, ...initialFiltersFromNav }))
        }
    }, [initialFiltersFromNav])

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải danh sách phòng...</p>
            </div>
        )
    }

    return (
        <div className="rooms-page">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="breadcrumb">
                    <Link to="/">Trang chủ</Link>
                    <span> / </span>
                    <span>Danh sách phòng trọ</span>
                </nav>

                {/* Page Header */}
                <div className="page-header">
                    <h1>Danh sách phòng trọ</h1>
                    <p>Tìm thấy {filteredRooms.length} phòng phù hợp</p>
                </div>

                {/* SearchBar */}
                <div className="search-bar-container">
                    <SearchBar
                        onSearch={handleSearch}
                        showFilters={true}
                    />
                </div>

                {/* Rooms Grid */}
                <div className="rooms-grid">
                    {error && (
                        <div className="error">{error}</div>
                    )}
                    {!error && filteredRooms.length > 0 ? (
                        filteredRooms.map(room => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                showAmenities={true}
                            />
                        ))
                    ) : !error && (
                        <div className="no-results">
                            <h3>Không tìm thấy phòng phù hợp</h3>
                            <p>Hãy thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác</p>
                        </div>
                    )}
                </div>

                {/* Load More */}
                {filteredRooms.length > 0 && (
                    <div className="load-more-section">
                        <button className="btn-load-more">
                            Xem thêm phòng
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RoomList