import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import RoomCard, { Room } from '../../components/RoomCard/RoomCard'
import SearchBar, { SearchFilters } from '../../components/SearchBar/SearchBar'
import './RoomList.css'

// Mock data - trong thực tế sẽ fetch từ API
const mockRooms: Room[] = [
    {
        id: 1,
        title: 'Phòng trọ cao cấp Quận 1',
        price: 3000000,
        area: 25,
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
        amenities: ['Wifi', 'Máy lạnh', 'Chỗ để xe', 'Bảo vệ', 'Camera', 'Tủ lạnh'],
        rating: 4.5,
        description: 'Phòng trọ mới xây, view thành phố, gần trung tâm.'
    },
    {
        id: 2,
        title: 'Chung cư mini Quận 3',
        price: 2500000,
        area: 20,
        address: '456 Lê Văn Sỹ, Quận 3, TP.HCM',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
        amenities: ['Wifi', 'Bảo vệ', 'Thang máy', 'Máy giặt', 'Pinh', 'Gác lửng'],
        rating: 4.2,
        description: 'Chung cư mini mới, an ninh tốt, tiện nghi đầy đủ.'
    },
    {
        id: 3,
        title: 'Studio Quận Bình Thạnh',
        price: 3500000,
        area: 30,
        address: '789 Điện Biên Phủ, Bình Thạnh, TP.HCM',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
        amenities: ['Wifi', 'Máy lạnh', 'Bếp', 'Máy giặt', 'Hồ bơi', 'GYM'],
        rating: 4.8,
        description: 'Studio full nội thất, view sông Sài Gòn.'
    },
    {
        id: 4,
        title: 'Nhà trọ sinh viên Quận Thủ Đức',
        price: 1800000,
        area: 15,
        address: '321 Võ Văn Ngân, Thủ Đức, TP.HCM',
        image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800',
        amenities: ['Wifi', 'Máy lạnh', 'Chỗ để xe', 'Bảo vệ'],
        rating: 4.0,
        description: 'Phòng trọ giá rẻ cho sinh viên, gần đại học.'
    },
    {
        id: 5,
        title: 'Căn hộ dịch vụ Quận 7',
        price: 4200000,
        area: 35,
        address: '654 Nguyễn Thị Thập, Quận 7, TP.HCM',
        image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        amenities: ['Wifi', 'Máy lạnh', 'Bếp', 'Máy giặt', 'Hồ bơi', 'GYM', 'Camera'],
        rating: 4.7,
        description: 'Căn hộ cao cấp, đầy đủ tiện nghi, an ninh.'
    },
    {
        id: 6,
        title: 'Phòng trọ Quận Gò Vấp',
        price: 2200000,
        area: 18,
        address: '987 Quang Trung, Gò Vấp, TP.HCM',
        image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
        amenities: ['Wifi', 'Máy lạnh', 'Chỗ để xe', 'Tủ lạnh'],
        rating: 4.1,
        description: 'Phòng trọ mới, sạch sẽ, yên tĩnh.'
    }
]

const RoomList = () => {
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
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
            const matchesSearch = filters.location === '' ||
                room.title.toLowerCase().includes(filters.location.toLowerCase()) ||
                room.address.toLowerCase().includes(filters.location.toLowerCase())

            const matchesPrice = room.price >= filters.priceRange.min &&
                room.price <= filters.priceRange.max

            const matchesArea = room.area >= filters.area.min &&
                room.area <= filters.area.max

            return matchesSearch && matchesPrice && matchesArea
        })
    }, [rooms, filters])

    const handleSearch = useCallback((searchFilters: SearchFilters) => {
        setFilters(searchFilters)
    }, [])

    useEffect(() => {
        // Simulate API call
        const fetchRooms = async () => {
            setLoading(true)
            try {
                await new Promise(resolve => setTimeout(resolve, 1000))
                setRooms(mockRooms)
            } catch (error) {
                console.error('Failed to fetch rooms:', error)
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
                    {filteredRooms.length > 0 ? (
                        filteredRooms.map(room => (
                            <RoomCard
                                key={room.id}
                                room={room}
                                showAmenities={true}
                            />
                        ))
                    ) : (
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