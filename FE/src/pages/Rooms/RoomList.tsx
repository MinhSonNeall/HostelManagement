import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import RoomCard, { Room } from '../../components/RoomCard/RoomCard'
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
    const [searchTerm, setSearchTerm] = useState('')
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000])
    const [selectedDistrict, setSelectedDistrict] = useState('')

    // Filter rooms based on criteria
    const filteredRooms = useMemo(() => {
        return rooms.filter(room => {
            const matchesSearch = room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                room.address.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesPrice = room.price >= priceRange[0] && room.price <= priceRange[1]
            const matchesDistrict = !selectedDistrict || room.address.includes(selectedDistrict)

            return matchesSearch && matchesPrice && matchesDistrict
        })
    }, [rooms, searchTerm, priceRange, selectedDistrict])

    useEffect(() => {
        // Simulate API call
        const fetchRooms = async () => {
            setLoading(true)
            try {
                // In real app, this would be an API call
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

    // Get unique districts for filter
    const districts = useMemo(() => {
        const allDistricts = rooms.map(room => {
            const match = room.address.match(/Quận\s+\d+|Bình Thạnh|Thủ Đức|Gò Vấp|Tân Bình|Phú Nhuận/)
            return match ? match[0] : 'Khác'
        })
        return [...new Set(allDistricts)].filter(Boolean)
    }, [rooms])

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

                {/* Filters */}
                <div className="filters-section">
                    <div className="search-filter">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên phòng hoặc địa chỉ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="filter-grid">
                        <div className="filter-group">
                            <label>Khoảng giá:</label>
                            <select
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                className="filter-select"
                            >
                                <option value={2000000}>Dưới 2 triệu</option>
                                <option value={3000000}>Dưới 3 triệu</option>
                                <option value={4000000}>Dưới 4 triệu</option>
                                <option value={5000000}>Tất cả giá</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Quận:</label>
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">Tất cả quận</option>
                                {districts.map(district => (
                                    <option key={district} value={district}>
                                        {district}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
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

                {/* Load More (for pagination) */}
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