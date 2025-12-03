import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { roomApi } from '../../api/rooms'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { hostelApi } from '../../api/hostels'
import type { Room, RoomStatus, Hostel } from '../../types'
import './RoomManagement.css'

const RoomManagement = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const { user } = useAuth()
  const ownerId = Number(user?.id)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [hostelLoading, setHostelLoading] = useState(true)

  useEffect(() => {
    if (ownerId) {
      loadHostels()
    } else {
      setHostelLoading(false)
    }
  }, [ownerId])

  const loadRooms = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await roomApi.getAll()
      setRooms(data)
    } catch (err) {
      setError('Không thể tải danh sách phòng. Vui lòng thử lại sau.')
      showNotification('Không thể tải danh sách phòng. Vui lòng thử lại sau.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadHostels = async () => {
    try {
      setHostelLoading(true)
      const data = await hostelApi.getByOwner(ownerId)
      setHostels(data)
      if (data.length > 0) {
        await loadRooms()
      } else {
        setRooms([])
        setLoading(false)
      }
    } catch (err) {
      showNotification('Không thể tải danh sách dãy trọ. Vui lòng thử lại sau.', 'error')
      setHostels([])
      setRooms([])
      setLoading(false)
    } finally {
      setHostelLoading(false)
    }
  }

  const handleDelete = async (id: string, roomNumber: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phòng ${roomNumber}?`)) {
      return
    }

    try {
      await roomApi.delete(id)
      setRooms(rooms.filter(room => room.id !== id))
      showNotification(`Xóa phòng ${roomNumber} thành công!`, 'warning')
    } catch (err) {
      showNotification('Không thể xóa phòng. Vui lòng thử lại sau.', 'error')
    }
  }

  const getStatusLabel = (status: RoomStatus): string => {
    switch (status) {
      case 'AVAILABLE':
        return 'Còn trống'
      case 'OCCUPIED':
      case 'RENTED':
        return 'Đã thuê'
      case 'MAINTENANCE':
        return 'Bảo trì'
      default:
        return status
    }
  }

  const getStatusClass = (status: RoomStatus): string => {
    switch (status) {
      case 'AVAILABLE':
        return 'status-available'
      case 'OCCUPIED':
      case 'RENTED':
        return 'status-occupied'
      case 'MAINTENANCE':
        return 'status-maintenance'
      default:
        return ''
    }
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN').format(price)
  }

  if (loading || hostelLoading) {
    return (
      <div className="room-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="room-management">
      <div className="room-management-header">
        <h1>Quản Lý Phòng Trọ</h1>
        <div className="header-actions">
          <button 
            className="btn-outline"
            onClick={() => navigate('/owner/hostels')}
          >
            Xem Dãy Trọ
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/owner/hostels/create')}
          >
            + Tạo Dãy Trọ
          </button>
          <button 
            className="btn-create"
            onClick={() => navigate('/owner/rooms/create')}
            disabled={!hostels.length}
          >
            + Thêm Phòng Mới
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadRooms} className="btn-retry">Thử lại</button>
        </div>
      )}

      {!hostels.length && !error ? (
        <div className="empty-state">
          <h3>Bạn chưa có dãy trọ nào</h3>
          <p>Tạo dãy trọ trước, sau đó bạn có thể thêm phòng cho từng dãy.</p>
          <div className="empty-actions">
            <button 
              className="btn-create"
              onClick={() => navigate('/owner/hostels/create')}
            >
              + Tạo Dãy Trọ
            </button>
          </div>
        </div>
      ) : rooms.length === 0 && !error ? (
        <div className="empty-state">
          <p>Chưa có phòng nào. Hãy thêm phòng mới!</p>
          <button 
            className="btn-create"
            onClick={() => navigate('/owner/rooms/create')}
          >
            + Thêm Phòng Mới
          </button>
        </div>
      ) : (
        <div className="rooms-table-container">
          <table className="rooms-table">
            <thead>
              <tr>
                <th>Mã Phòng</th>
                <th>Tầng</th>
                <th>Diện Tích (m²)</th>
                <th>Giá (VNĐ/tháng)</th>
                <th>Trạng Thái</th>
                <th>Mô Tả</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="room-number">{room.roomNumber}</td>
                  <td>{room.floor}</td>
                  <td>{room.area}</td>
                  <td className="price">{formatPrice(room.price)}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(room.status)}`}>
                      {getStatusLabel(room.status)}
                    </span>
                  </td>
                  <td className="description">
                    {room.description || '-'}
                  </td>
                  <td className="actions">
                    <button
                      className="btn-edit"
                      onClick={() => navigate(`/owner/rooms/update/${room.id}`)}
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(room.id, room.roomNumber)}
                    >
                      🗑️ Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default RoomManagement

