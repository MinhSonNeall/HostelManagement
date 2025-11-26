import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { roomApi } from '../../api/rooms'
import { useNotification } from '../../contexts/NotificationContext'
import type { RoomStatus } from '../../types'
import './RoomManagement.css'

const CreateRoom = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: 1,
    area: 0,
    price: 0,
    status: 'AVAILABLE' as RoomStatus,
    description: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'floor' || name === 'area' || name === 'price' 
        ? Number(value) 
        : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.roomNumber.trim()) {
      showNotification('Vui lòng nhập mã phòng!', 'error')
      return
    }

    if (formData.area <= 0) {
      showNotification('Diện tích phải lớn hơn 0!', 'error')
      return
    }

    if (formData.price <= 0) {
      showNotification('Giá phòng phải lớn hơn 0!', 'error')
      return
    }

    try {
      setLoading(true)
      await roomApi.create(formData)
      showNotification('Tạo phòng thành công!', 'success')
      navigate('/owner/rooms')
    } catch (error) {
      showNotification('Không thể tạo phòng. Vui lòng thử lại sau.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="room-management">
      <div className="room-form-container">
        <div className="room-form-header">
          <h1>Thêm Phòng Mới</h1>
          <button 
            className="btn-back"
            onClick={() => navigate('/owner/rooms')}
          >
            ← Quay lại
          </button>
        </div>

        <form onSubmit={handleSubmit} className="room-form">
          <div className="form-group">
            <label htmlFor="roomNumber">Mã Phòng *</label>
            <input
              type="text"
              id="roomNumber"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              required
              placeholder="VD: P101, A201"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="floor">Tầng *</label>
              <input
                type="number"
                id="floor"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="area">Diện Tích (m²) *</label>
              <input
                type="number"
                id="area"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
                min="1"
                step="0.1"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="price">Giá Thuê (VNĐ/tháng) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Trạng Thái *</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="AVAILABLE">Còn trống</option>
              <option value="OCCUPIED">Đã thuê</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô Tả</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Mô tả về phòng trọ..."
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/owner/rooms')}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Tạo Phòng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateRoom

