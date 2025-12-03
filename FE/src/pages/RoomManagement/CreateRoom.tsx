import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { roomApi } from '../../api/rooms'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { hostelApi } from '../../api/hostels'
import { roomPictureApi } from '../../api/roomPictures'
import { uploadCloudinaryImage } from '../../api/cloudinary'
import type { RoomStatus, Hostel } from '../../types'
import './RoomManagement.css'

const CURRENCY_FIELDS = [
  'pricePerMonth',
  'depositAmount',
  'electricityPricePerKwh',
  'waterPricePerM3',
  'wifiFee',
  'parkingFee',
] as const

type CurrencyField = (typeof CURRENCY_FIELDS)[number]

const isCurrencyField = (field: string): field is CurrencyField =>
  (CURRENCY_FIELDS as readonly string[]).includes(field as CurrencyField)

const formatCurrency = (value: number) => {
  if (!value) return ''
  return new Intl.NumberFormat('vi-VN').format(value)
}

const parseCurrencyInput = (value: string) => {
  const digits = value.replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}

const CreateRoom = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showNotification } = useNotification()
  const { user } = useAuth()
  const ownerId = Number(user?.id)
  const [loading, setLoading] = useState(false)
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [hostelLoading, setHostelLoading] = useState(true)
  const preferredHostelId = useMemo(() => {
    const value = searchParams.get('hostelId')
    return value ? Number(value) : null
  }, [searchParams])
  const [formData, setFormData] = useState({
    hostelId: 0,
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
    roomStatus: 'AVAILABLE' as RoomStatus,
    hasAirConditioner: false,
    hasWaterHeater: false,
    hasPrivateBathroom: true,
    hasKitchen: false,
    allowPet: false,
    description: ''
  })
  const [roomImages, setRoomImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [currencyInputs, setCurrencyInputs] = useState<Record<CurrencyField, string>>({
    pricePerMonth: '',
    depositAmount: '',
    electricityPricePerKwh: '',
    waterPricePerM3: '',
    wifiFee: '',
    parkingFee: '',
  })

  useEffect(() => {
    if (ownerId) {
      loadHostels()
    } else {
      setHostelLoading(false)
    }
  }, [ownerId])

  useEffect(() => {
    if (hostels.length > 0) {
      setFormData((prev) => ({
        ...prev,
        hostelId:
          preferredHostelId && hostels.some((h) => h.hostelId === preferredHostelId)
            ? preferredHostelId
            : prev.hostelId || hostels[0].hostelId,
      }))
    }
  }, [hostels, preferredHostelId])

  useEffect(() => {
    setCurrencyInputs({
      pricePerMonth: formatCurrency(formData.pricePerMonth),
      depositAmount: formatCurrency(formData.depositAmount),
      electricityPricePerKwh: formatCurrency(formData.electricityPricePerKwh),
      waterPricePerM3: formatCurrency(formData.waterPricePerM3),
      wifiFee: formatCurrency(formData.wifiFee),
      parkingFee: formatCurrency(formData.parkingFee),
    })
  }, [
    formData.pricePerMonth,
    formData.depositAmount,
    formData.electricityPricePerKwh,
    formData.waterPricePerM3,
    formData.wifiFee,
    formData.parkingFee,
  ])

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [imagePreviews])

  const loadHostels = async () => {
    try {
      setHostelLoading(true)
      const data = await hostelApi.getByOwner(ownerId)
      setHostels(data)
    } catch (error) {
      showNotification('Không thể tải danh sách dãy trọ. Vui lòng thử lại sau.', 'error')
    } finally {
      setHostelLoading(false)
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

    if (isCurrencyField(name)) {
      const numericValue = parseCurrencyInput(value)
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }))
      setCurrencyInputs((prev) => ({
        ...prev,
        [name]: formatCurrency(numericValue),
      }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: isCheckbox
        ? target.checked
        : numericFields.includes(name)
          ? Number(value)
          : value,
    }))
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return

    const validImages = files.filter((file) => file.type.startsWith('image/'))
    const nextImages = [...roomImages, ...validImages].slice(0, 8)

    const nextPreviews = nextImages.map((file, idx) => {
      if (roomImages[idx] === file && imagePreviews[idx]) {
        return imagePreviews[idx]
      }
      return URL.createObjectURL(file)
    })

    imagePreviews.forEach((preview, idx) => {
      if (!nextImages[idx]) {
        URL.revokeObjectURL(preview)
      }
    })

    setRoomImages(nextImages)
    setImagePreviews(nextPreviews)
  }

  const handleRemoveImage = (index: number) => {
    setRoomImages((prev) => prev.filter((_, idx) => idx !== index))
    setImagePreviews((prev) => {
      const updated = prev.filter((_, idx) => idx !== index)
      const removed = prev[index]
      if (removed) {
        URL.revokeObjectURL(removed)
      }
      return updated
    })
  }

  const uploadRoomPictures = async (roomId: number, hostelId?: number) => {
    for (let index = 0; index < roomImages.length; index += 1) {
      const file = roomImages[index]
      const uploadResult = await uploadCloudinaryImage(file, {
        folder: `rooms/${hostelId || 'general'}/${roomId}`,
      })
      await roomPictureApi.create({
        roomId,
        pictureUrl: uploadResult.secure_url,
        isPrimary: index === 0,
        displayOrder: index,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hostels.length) {
      showNotification('Vui lòng tạo dãy trọ trước khi thêm phòng.', 'error')
      return
    }
    
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
      const createdRoom = await roomApi.create(formData)

      if (roomImages.length > 0 && createdRoom.roomId) {
        setUploadingImages(true)
        try {
          await uploadRoomPictures(createdRoom.roomId, createdRoom.hostelId ?? formData.hostelId)
        } catch (error: any) {
          showNotification(
            error?.message || 'Không thể lưu ảnh phòng. Vui lòng thử lại sau.',
            'error'
          )
        } finally {
          setUploadingImages(false)
        }
      }

      showNotification('Tạo phòng thành công!', 'success')
      navigate('/owner/rooms')
    } catch (error: any) {
      showNotification(
        error?.response?.data?.message || 'Không thể tạo phòng. Vui lòng thử lại sau.',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  if (hostelLoading) {
    return (
      <div className="room-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách dãy trọ...</p>
        </div>
      </div>
    )
  }

  if (!hostels.length) {
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
          <div className="empty-state">
            <h3>Bạn chưa có dãy trọ nào</h3>
            <p>Hãy tạo dãy trọ trước, sau đó mới có thể thêm phòng.</p>
            <div className="empty-actions">
              <button 
                className="btn-create"
                onClick={() => navigate('/owner/hostels/create')}
              >
                + Tạo Dãy Trọ
              </button>
            </div>
          </div>
        </div>
      </div>
    )
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
            <label htmlFor="hostelId">Chọn Dãy Trọ *</label>
            <select
              id="hostelId"
              name="hostelId"
              value={formData.hostelId}
              onChange={handleChange}
              required
            >
              {hostels.map((hostel) => (
                <option key={hostel.hostelId} value={hostel.hostelId}>
                  {hostel.hostelName}
                </option>
              ))}
            </select>
            <small className="helper-text">
              Không tìm thấy dãy phù hợp?{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => navigate('/owner/hostels/create')}
              >
                Tạo dãy trọ mới
              </button>
            </small>
          </div>
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
              type="text"
              inputMode="numeric"
              id="pricePerMonth"
              name="pricePerMonth"
              value={currencyInputs.pricePerMonth}
              onChange={handleChange}
              required
              placeholder="Ví dụ: 5.000.000"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="depositAmount">Tiền Cọc (VNĐ)</label>
              <input
                type="text"
                inputMode="numeric"
                id="depositAmount"
                name="depositAmount"
                value={currencyInputs.depositAmount}
                onChange={handleChange}
                placeholder="Ví dụ: 10.000.000"
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
                type="text"
                inputMode="numeric"
                id="electricityPricePerKwh"
                name="electricityPricePerKwh"
                value={currencyInputs.electricityPricePerKwh}
                onChange={handleChange}
                placeholder="Ví dụ: 3.500"
              />
            </div>
            <div className="form-group">
              <label htmlFor="waterPricePerM3">Giá Nước (VNĐ/m³)</label>
              <input
                type="text"
                inputMode="numeric"
                id="waterPricePerM3"
                name="waterPricePerM3"
                value={currencyInputs.waterPricePerM3}
                onChange={handleChange}
                placeholder="Ví dụ: 15.000"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="wifiFee">Phí Wifi (VNĐ)</label>
              <input
                type="text"
                inputMode="numeric"
                id="wifiFee"
                name="wifiFee"
                value={currencyInputs.wifiFee}
                onChange={handleChange}
                placeholder="Ví dụ: 100.000"
              />
            </div>
            <div className="form-group">
              <label htmlFor="parkingFee">Phí Gửi Xe (VNĐ)</label>
              <input
                type="text"
                inputMode="numeric"
                id="parkingFee"
                name="parkingFee"
                value={currencyInputs.parkingFee}
                onChange={handleChange}
                placeholder="Ví dụ: 150.000"
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

          <div className="form-group">
            <label htmlFor="roomImages">Ảnh Phòng (tối đa 8 ảnh)</label>
            <div className="room-image-upload">
              <input
                type="file"
                id="roomImages"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
              />
              <p>Ảnh đầu tiên sẽ được dùng làm ảnh đại diện phòng.</p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="room-image-preview-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={`${preview}-${index}`} className="room-image-preview-card">
                    <img src={preview} alt={`Ảnh phòng ${index + 1}`} />
                    <button
                      type="button"
                      className="room-image-remove"
                      onClick={() => handleRemoveImage(index)}
                    >
                      ×
                    </button>
                    {index === 0 && <span className="room-image-primary">Ảnh chính</span>}
                  </div>
                ))}
              </div>
            )}
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
              disabled={loading || uploadingImages}
            >
              {uploadingImages ? 'Đang tải ảnh...' : loading ? 'Đang tạo...' : 'Tạo Phòng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateRoom

