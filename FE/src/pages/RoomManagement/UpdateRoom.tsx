import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { roomApi } from '../../api/rooms'
import { roomPictureApi } from '../../api/roomPictures'
import { uploadCloudinaryImage } from '../../api/cloudinary'
import { useNotification } from '../../contexts/NotificationContext'
import type { RoomPicture } from '../../types'
import { RoomStatus } from '../../types'
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
type PrimarySelection =
  | { kind: 'existing'; id: number }
  | { kind: 'new'; index: number }

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
  const [existingPictures, setExistingPictures] = useState<RoomPicture[]>([])
  const [picturesToDelete, setPicturesToDelete] = useState<Set<number>>(new Set())
  const [roomImages, setRoomImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [primarySelection, setPrimarySelection] = useState<PrimarySelection | null>(null)
  const [currencyInputs, setCurrencyInputs] = useState<Record<CurrencyField, string>>({
    pricePerMonth: '',
    depositAmount: '',
    electricityPricePerKwh: '',
    waterPricePerM3: '',
    wifiFee: '',
    parkingFee: '',
  })

  useEffect(() => {
    if (id) {
      loadRoom()
    }
  }, [id])

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
      setExistingPictures(room.pictures ?? [])
      const primaryPicture = room.pictures?.find((picture) => picture.isPrimary)
      setPrimarySelection(primaryPicture ? { kind: 'existing', id: primaryPicture.pictureId } : null)
      setPicturesToDelete(new Set())
      setRoomImages([])
      setImagePreviews([])
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
    setPrimarySelection((prev) => {
      if (prev?.kind === 'new') {
        if (prev.index === index) return null
        if (prev.index > index) return { kind: 'new', index: prev.index - 1 }
      }
      return prev
    })
  }

  const toggleExistingPictureRemoval = (pictureId: number) => {
    setPicturesToDelete((prev) => {
      const next = new Set(prev)
      if (next.has(pictureId)) {
        next.delete(pictureId)
      } else {
        next.add(pictureId)
        if (primarySelection?.kind === 'existing' && primarySelection.id === pictureId) {
          setPrimarySelection(null)
        }
      }
      return next
    })
  }

  const handlePrimarySelectExisting = (pictureId: number) => {
    if (picturesToDelete.has(pictureId)) return
    setPrimarySelection({ kind: 'existing', id: pictureId })
  }

  const handlePrimarySelectNew = (index: number) => {
    setPrimarySelection({ kind: 'new', index })
  }

  const uploadNewPictures = async (
    roomId: number,
    hostelId: number,
    primaryNewIndex: number | null
  ) => {
    let createdPrimaryId: number | null = null
    for (let index = 0; index < roomImages.length; index += 1) {
      const file = roomImages[index]
      const uploadResult = await uploadCloudinaryImage(file, {
        folder: `rooms/${hostelId || 'general'}/${roomId}`,
      })
      const created = await roomPictureApi.create({
        roomId,
        pictureUrl: uploadResult.secure_url,
        isPrimary: primaryNewIndex === index,
        displayOrder: existingPictures.length + index,
      })
      if (primaryNewIndex === index) {
        createdPrimaryId = created.pictureId
      }
    }
    return createdPrimaryId
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
      const roomIdNumber = Number(id)
      const availableExisting = existingPictures.filter(
        (picture) => !picturesToDelete.has(picture.pictureId)
      )

      let effectivePrimary = primarySelection
      if (!effectivePrimary) {
        if (availableExisting.length > 0) {
          effectivePrimary = { kind: 'existing', id: availableExisting[0].pictureId }
        } else if (roomImages.length > 0) {
          effectivePrimary = { kind: 'new', index: 0 }
        }
      }

      if (picturesToDelete.size > 0) {
        await Promise.all(
          Array.from(picturesToDelete).map((pictureId) => roomPictureApi.delete(pictureId))
        )
      }

      if (roomImages.length > 0) {
        setUploadingImages(true)
        try {
          await uploadNewPictures(
            roomIdNumber,
            formData.hostelId,
            effectivePrimary?.kind === 'new' ? effectivePrimary.index : null
          )
        } catch (error: any) {
          showNotification(
            error?.message || 'Không thể cập nhật ảnh phòng. Vui lòng thử lại sau.',
            'error'
          )
        } finally {
          setUploadingImages(false)
        }
      }

      const selectedExistingPrimaryId =
        effectivePrimary?.kind === 'existing' ? effectivePrimary.id : null
      const updatePromises = availableExisting
        .map((picture) => {
          const shouldBePrimary = selectedExistingPrimaryId === picture.pictureId
          if (picture.isPrimary === shouldBePrimary) {
            return null
          }
          return roomPictureApi.update(picture.pictureId, { isPrimary: shouldBePrimary })
        })
        .filter(Boolean) as Promise<any>[]
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises)
      }

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

          {existingPictures.length > 0 && (
            <div className="form-group">
              <label>Ảnh hiện có</label>
              <div className="room-image-preview-grid">
                {existingPictures.map((picture) => {
                  const isMarked = picturesToDelete.has(picture.pictureId)
                  const isPrimary =
                    primarySelection?.kind === 'existing' && primarySelection.id === picture.pictureId
                  return (
                    <div
                      key={picture.pictureId}
                      className={`room-image-preview-card ${isMarked ? 'marked-for-delete' : ''}`}
                    >
                      <img
                        src={picture.pictureUrl}
                        alt={picture.pictureDescription || `Ảnh phòng ${picture.pictureId}`}
                      />
                      {isPrimary && <span className="room-image-primary">Ảnh chính</span>}
                      {isMarked && <span className="room-image-delete-flag">Sẽ xóa</span>}
                      <div className="room-image-card-footer">
                        <label>
                          <input
                            type="radio"
                            name="primaryPicture"
                            checked={isPrimary}
                            onChange={() => handlePrimarySelectExisting(picture.pictureId)}
                            disabled={isMarked}
                          />
                          Chọn làm ảnh chính
                        </label>
                        <button
                          type="button"
                          className="room-image-chip"
                          onClick={() => toggleExistingPictureRemoval(picture.pictureId)}
                        >
                          {isMarked ? 'Hoàn tác' : 'Xóa ảnh'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="newRoomImages">Thêm ảnh mới (tối đa 8 ảnh)</label>
            <div className="room-image-upload">
              <input
                type="file"
                id="newRoomImages"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
              />
              <p>Ảnh mới sẽ được tải lên Cloudinary và lưu lại cho phòng này.</p>
            </div>

            {imagePreviews.length > 0 && (
              <div className="room-image-preview-grid">
                {imagePreviews.map((preview, index) => (
                  <div key={`${preview}-${index}`} className="room-image-preview-card">
                    <img src={preview} alt={`Ảnh mới ${index + 1}`} />
                    <button
                      type="button"
                      className="room-image-remove"
                      onClick={() => handleRemoveImage(index)}
                    >
                      ×
                    </button>
                    {primarySelection?.kind === 'new' && primarySelection.index === index && (
                      <span className="room-image-primary">Ảnh chính</span>
                    )}
                    <div className="room-image-card-footer">
                      <label>
                        <input
                          type="radio"
                          name="primaryPicture"
                          checked={
                            primarySelection?.kind === 'new' && primarySelection.index === index
                          }
                          onChange={() => handlePrimarySelectNew(index)}
                        />
                        Chọn làm ảnh chính
                      </label>
                    </div>
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
              {uploadingImages ? 'Đang xử lý ảnh...' : loading ? 'Đang cập nhật...' : 'Cập Nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UpdateRoom

