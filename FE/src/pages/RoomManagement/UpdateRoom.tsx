import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { roomApi } from '../../api/rooms'
import { useNotification } from '../../contexts/NotificationContext'
import type { Room } from '../../types'
import { RoomStatus } from '../../types'
import './RoomManagement.css'

const UpdateRoom = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { showNotification } = useNotification()
  const [loading, setLoading] = useState(false)
  const [loadingRoom, setLoadingRoom] = useState(true)
  const [formData, setFormData] = useState({
    hostelId: 1,
    roomNumber: '',
    floor: 1,
    areaM2: 0,
    pricePerMonth: 0,
    depositAmount: 0,
    maxOccupants: 1,
    electricityPricePerKwh: 0,
    waterPricePerM3: 0,
    wifiFee: 0,
    parkingFee: 0,
    roomStatus: RoomStatus.AVAILABLE,
    hasAirConditioner: false,
    hasWaterHeater: false,
    hasPrivateBathroom: true,
    hasKitchen: false,
    allowPet: false,
    description: ''
  })

  useEffect(() => {
    if (id) {
      loadRoom()
    }
  }, [id])

  const loadRoom = async () => {
    if (!id) return

    try {
      setLoadingRoom(true)
      const room = await roomApi.getById(id)
      setFormData({
        hostelId: room.hostelId ?? 1,
        roomNumber: room.roomNumber,
        floor: room.floor,
        areaM2: room.area ?? room.areaM2 ?? 0,
        pricePerMonth: room.price ?? room.pricePerMonth ?? 0,
        depositAmount: room.depositAmount ?? 0,
        maxOccupants: room.maxOccupants ?? 1,
        electricityPricePerKwh: room.electricityPricePerKwh ?? 0,
        waterPricePerM3: room.waterPricePerM3 ?? 0,
        wifiFee: room.wifiFee ?? 0,
        parkingFee: room.parkingFee ?? 0,
        roomStatus: room.status ?? room.roomStatus ?? RoomStatus.AVAILABLE,
        hasAirConditioner: room.hasAirConditioner ?? false,
        hasWaterHeater: room.hasWaterHeater ?? false,
        hasPrivateBathroom: room.hasPrivateBathroom ?? true,
        hasKitchen: room.hasKitchen ?? false,
        allowPet: room.allowPet ?? false,
        description: room.description ?? ''
      })
    } catch (error) {
      showNotification('Không thể tải thông tin phòng. Vui lòng thử lại sau.', 'error')
      navigate('/owner/rooms')
    } finally {
      setLoadingRoom(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target
    const { name, value } = target
    const isCheckbox =
      target instanceof HTMLInputElement && target.type === 'checkbox'
    const numericFields = [
      'hostelId',
      'floor',
      'areaM2',
      'pricePerMonth',
      'depositAmount',
      'maxOccupants',
      'electricityPricePerKwh',
      'waterPricePerM3',
      'wifiFee',
      'parkingFee',
    ]

    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox
        ? target.checked
        : numericFields.includes(name)
          ? Number(value)
          : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!id) return

    if (!formData.roomNumber.trim()) {
      showNotification('Vui lòng nhập mã phòng!', 'error')
      return
    }

    if (formData.areaM2 <= 0) {
      showNotification('Diện tích phải lớn hơn 0!', 'error')
      return
    }

    if (formData.pricePerMonth <= 0) {
      showNotification('Giá phòng phải lớn hơn 0!', 'error')
      return
    }

    try {
      setLoading(true)
      await roomApi.update(id, {
        ...formData,
        area: formData.areaM2,
        price: formData.pricePerMonth,
        status: formData.roomStatus,
      })
      showNotification('Cập nhật phòng thành công!', 'info')
      navigate('/owner/rooms')
    } catch (error) {
      showNotification('Không thể cập nhật phòng. Vui lòng thử lại sau.', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loadingRoom) {
    return (
      <div className="room-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin phòng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="room-management">
      <div className="room-form-container">
        <div className="room-form-header">
          <h1>Cập Nhật Phòng</h1>
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
              <label htmlFor="hostelId">ID Nhà Trọ *</label>
              <input
                type="number"
                id="hostelId"
                name="hostelId"
                value={formData.hostelId}
                onChange={handleChange}
                required
                min="1"
              />
            </div>
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
              <label htmlFor="areaM2">Diện Tích (m²) *</label>
              <input
                type="number"
                id="areaM2"
                name="areaM2"
                value={formData.areaM2}
                onChange={handleChange}
                required
                min="1"
                step="0.1"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="pricePerMonth">Giá Thuê (VNĐ/tháng) *</label>
            <input
              type="number"
              id="pricePerMonth"
              name="pricePerMonth"
              value={formData.pricePerMonth}
              onChange={handleChange}
              required
              min="1"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="depositAmount">Tiền Cọc (VNĐ)</label>
              <input
                type="number"
                id="depositAmount"
                name="depositAmount"
                value={formData.depositAmount}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="maxOccupants">Số Người Tối Đa</label>
              <input
                type="number"
                id="maxOccupants"
                name="maxOccupants"
                value={formData.maxOccupants}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="roomStatus">Trạng Thái *</label>
            <select
              id="roomStatus"
              name="roomStatus"
              value={formData.roomStatus}
              onChange={handleChange}
              required
            >
              <option value="AVAILABLE">Còn trống</option>
              <option value="RENTED">Đã thuê</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="electricityPricePerKwh">Giá Điện (VNĐ/kWh)</label>
              <input
                type="number"
                id="electricityPricePerKwh"
                name="electricityPricePerKwh"
                value={formData.electricityPricePerKwh}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="waterPricePerM3">Giá Nước (VNĐ/m³)</label>
              <input
                type="number"
                id="waterPricePerM3"
                name="waterPricePerM3"
                value={formData.waterPricePerM3}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="wifiFee">Phí Wifi (VNĐ)</label>
              <input
                type="number"
                id="wifiFee"
                name="wifiFee"
                value={formData.wifiFee}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="parkingFee">Phí Gửi Xe (VNĐ)</label>
              <input
                type="number"
                id="parkingFee"
                name="parkingFee"
                value={formData.parkingFee}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>Tiện ích</label>
            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="hasAirConditioner"
                  checked={formData.hasAirConditioner}
                  onChange={handleChange}
                />
                Máy lạnh
              </label>
              <label>
                <input
                  type="checkbox"
                  name="hasWaterHeater"
                  checked={formData.hasWaterHeater}
                  onChange={handleChange}
                />
                Máy nước nóng
              </label>
              <label>
                <input
                  type="checkbox"
                  name="hasPrivateBathroom"
                  checked={formData.hasPrivateBathroom}
                  onChange={handleChange}
                />
                WC riêng
              </label>
              <label>
                <input
                  type="checkbox"
                  name="hasKitchen"
                  checked={formData.hasKitchen}
                  onChange={handleChange}
                />
                Bếp riêng
              </label>
              <label>
                <input
                  type="checkbox"
                  name="allowPet"
                  checked={formData.allowPet}
                  onChange={handleChange}
                />
                Cho phép thú cưng
              </label>
            </div>
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
              {loading ? 'Đang cập nhật...' : 'Cập Nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateRoom

