import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { hostelApi } from '../../api/hostels'
import { useNotification } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { uploadCloudinaryImage } from '../../api/cloudinary'
import { locationApi, type District, type Province, type Ward } from '../../api/locations'
import './RoomManagement.css'

const EditHostel = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { showNotification } = useNotification()
  const { user } = useAuth()
  const ownerId = Number(user?.id)

  const [loading, setLoading] = useState(false)
  const [loadingHostel, setLoadingHostel] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])
  const [locationLoading, setLocationLoading] = useState({
    provinces: false,
    districts: false,
    wards: false,
  })
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<number | null>(null)
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<number | null>(null)
  const [selectedWardCode, setSelectedWardCode] = useState<number | null>(null)
  const pendingProvinceCode = useRef<number | null>(null)
  const pendingDistrictCode = useRef<number | null>(null)
  const [formData, setFormData] = useState({
    hostelName: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    description: '',
    backgroundImg: '',
    totalFloors: 1,
    totalRooms: 0,
  })

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLocationLoading((prev) => ({ ...prev, provinces: true }))
        const data = await locationApi.getProvinces()
        setProvinces(data)
      } catch (error: any) {
        showNotification(error?.message || 'Không thể tải danh sách tỉnh/thành.', 'error')
      } finally {
        setLocationLoading((prev) => ({ ...prev, provinces: false }))
      }
    }
    fetchProvinces()
  }, [showNotification])

  useEffect(() => {
    const fetchHostel = async () => {
      if (!id) {
        showNotification('Thiếu thông tin dãy trọ để chỉnh sửa.', 'error')
        navigate('/owner/hostels')
        return
      }
      try {
        setLoadingHostel(true)
        const hostel = await hostelApi.getById(Number(id))
        setFormData({
          hostelName: hostel.hostelName,
          address: hostel.address,
          ward: hostel.ward ?? '',
          district: hostel.district ?? '',
          city: hostel.city ?? '',
          description: hostel.description ?? '',
          backgroundImg: hostel.backgroundImg ?? '',
          totalFloors: hostel.totalFloors ?? 1,
          totalRooms: hostel.totalRooms ?? 0,
        })
      } catch (error: any) {
        showNotification(error?.response?.data?.message || 'Không thể tải thông tin dãy trọ.', 'error')
        navigate('/owner/hostels')
      } finally {
        setLoadingHostel(false)
      }
    }
    fetchHostel()
  }, [id, navigate, showNotification])

  useEffect(() => {
    const prefillLocation = async () => {
      if (!formData.city || provinces.length === 0) return
      const province = provinces.find(
        (p) => p.name.toLowerCase() === formData.city.trim().toLowerCase()
      )
      if (!province) return

      setSelectedProvinceCode(province.code)
      pendingProvinceCode.current = province.code
      try {
        setLocationLoading((prev) => ({ ...prev, districts: true }))
        const fetchedDistricts = await locationApi.getDistricts(province.code)
        if (pendingProvinceCode.current === province.code) {
          setDistricts(fetchedDistricts)
        }
        if (formData.district) {
          const district = fetchedDistricts.find(
            (d) => d.name.toLowerCase() === formData.district.trim().toLowerCase()
          )
          if (district) {
            setSelectedDistrictCode(district.code)
            pendingDistrictCode.current = district.code
            setLocationLoading((prev) => ({ ...prev, wards: true }))
            const fetchedWards = await locationApi.getWards(district.code)
            if (pendingDistrictCode.current === district.code) {
              setWards(fetchedWards)
            }
            if (formData.ward) {
              const ward = fetchedWards.find(
                (w) => w.name.toLowerCase() === formData.ward.trim().toLowerCase()
              )
              if (ward) {
                setSelectedWardCode(ward.code)
              }
            }
          }
        }
      } catch (error) {
        console.error('Prefill location error', error)
      } finally {
        setLocationLoading((prev) => ({ ...prev, districts: false, wards: false }))
      }
    }

    prefillLocation()
  }, [formData.city, formData.district, formData.ward, provinces])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    const numericFields = ['totalFloors', 'totalRooms']

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }))
  }

  const handleProvinceSelect = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    const code = value ? Number(value) : null

    setFormData((prev) => ({
      ...prev,
      city: code ? provinces.find((province) => province.code === code)?.name ?? '' : '',
      district: '',
      ward: '',
    }))
    setDistricts([])
    setWards([])
    setSelectedDistrictCode(null)
    setSelectedWardCode(null)

    if (code) {
      setSelectedProvinceCode(code)
      pendingProvinceCode.current = code
      try {
        setLocationLoading((prev) => ({ ...prev, districts: true }))
        const fetchedDistricts = await locationApi.getDistricts(code)
        if (pendingProvinceCode.current === code) {
          setDistricts(fetchedDistricts)
        }
      } catch (error: any) {
        showNotification(error?.message || 'Không thể tải danh sách quận/huyện.', 'error')
      } finally {
        if (pendingProvinceCode.current === code) {
          setLocationLoading((prev) => ({ ...prev, districts: false }))
        }
      }
    } else {
      setSelectedProvinceCode(null)
      pendingProvinceCode.current = null
      setLocationLoading((prev) => ({ ...prev, districts: false, wards: false }))
    }
  }

  const handleDistrictSelect = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    const code = value ? Number(value) : null

    setFormData((prev) => ({
      ...prev,
      district: code ? districts.find((district) => district.code === code)?.name ?? '' : '',
      ward: '',
    }))
    setWards([])
    setSelectedWardCode(null)

    if (code) {
      setSelectedDistrictCode(code)
      pendingDistrictCode.current = code
      try {
        setLocationLoading((prev) => ({ ...prev, wards: true }))
        const fetchedWards = await locationApi.getWards(code)
        if (pendingDistrictCode.current === code) {
          setWards(fetchedWards)
        }
      } catch (error: any) {
        showNotification(error?.message || 'Không thể tải danh sách phường/xã.', 'error')
      } finally {
        if (pendingDistrictCode.current === code) {
          setLocationLoading((prev) => ({ ...prev, wards: false }))
        }
      }
    } else {
      setSelectedDistrictCode(null)
      pendingDistrictCode.current = null
      setLocationLoading((prev) => ({ ...prev, wards: false }))
    }
  }

  const handleWardSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    const code = value ? Number(value) : null

    if (code) {
      const ward = wards.find((w) => w.code === code)
      setFormData((prev) => ({
        ...prev,
        ward: ward?.name ?? '',
      }))
      setSelectedWardCode(code)
    } else {
      setFormData((prev) => ({
        ...prev,
        ward: '',
      }))
      setSelectedWardCode(null)
    }
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('Vui lòng chọn đúng định dạng ảnh.', 'error')
        return
      }
      setSelectedImage(file)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      const objectUrl = URL.createObjectURL(file)
      setPreviewUrl(objectUrl)
    } else {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      setSelectedImage(null)
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!ownerId || !id) {
      showNotification('Thiếu thông tin chủ trọ. Vui lòng đăng nhập lại.', 'error')
      return
    }

    if (!formData.hostelName.trim()) {
      showNotification('Vui lòng nhập tên dãy trọ', 'error')
      return
    }

    if (!formData.address.trim()) {
      showNotification('Vui lòng nhập địa chỉ', 'error')
      return
    }

    try {
      setLoading(true)
      let backgroundImgUrl = formData.backgroundImg?.trim() || ''

      if (selectedImage) {
        setUploadingImage(true)
        const uploadResult = await uploadCloudinaryImage(selectedImage, {
          folder: `hostels/${ownerId}`,
        })
        backgroundImgUrl = uploadResult.secure_url
      }

      await hostelApi.update(Number(id), {
        hostelId: Number(id),
        ownerId,
        ...formData,
        backgroundImg: backgroundImgUrl,
      })
      showNotification('Cập nhật dãy trọ thành công!', 'success')
      navigate('/owner/hostels')
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể cập nhật dãy trọ. Vui lòng thử lại.'
      showNotification(errorMessage, 'error')
    } finally {
      setLoading(false)
      setUploadingImage(false)
    }
  }

  if (loadingHostel) {
    return (
      <div className="room-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin dãy trọ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="room-management">
      <div className="room-form-container">
        <div className="room-form-header">
          <h1>Cập Nhật Dãy Trọ</h1>
          <button
            className="btn-back"
            onClick={() => navigate('/owner/hostels')}
          >
            ← Quay lại
          </button>
        </div>

        <form onSubmit={handleSubmit} className="room-form">
          <div className="form-group">
            <label htmlFor="hostelName">Tên Dãy Trọ *</label>
            <input
              type="text"
              id="hostelName"
              name="hostelName"
              value={formData.hostelName}
              onChange={handleChange}
              required
              placeholder="Ví dụ: Dãy A, Nhà trọ Minh Anh"
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Địa chỉ chi tiết *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Số nhà, đường..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">Tỉnh/Thành phố</label>
              <select
                id="city"
                value={selectedProvinceCode ?? ''}
                onChange={handleProvinceSelect}
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.name}
                  </option>
                ))}
              </select>
              {locationLoading.provinces && <p className="input-hint">Đang tải danh sách tỉnh/thành...</p>}
            </div>
            <div className="form-group">
              <label htmlFor="district">Quận/Huyện</label>
              <select
                id="district"
                value={selectedDistrictCode ?? ''}
                onChange={handleDistrictSelect}
                disabled={!selectedProvinceCode}
              >
                <option value="">
                  {selectedProvinceCode ? 'Chọn quận/huyện' : 'Chọn tỉnh/thành trước'}
                </option>
                {districts.map((district) => (
                  <option key={district.code} value={district.code}>
                    {district.name}
                  </option>
                ))}
              </select>
              {locationLoading.districts && <p className="input-hint">Đang tải danh sách quận/huyện...</p>}
            </div>
            <div className="form-group">
              <label htmlFor="ward">Phường/Xã</label>
              <select
                id="ward"
                value={selectedWardCode ?? ''}
                onChange={handleWardSelect}
                disabled={!selectedDistrictCode}
              >
                <option value="">
                  {selectedDistrictCode ? 'Chọn phường/xã' : 'Chọn quận/huyện trước'}
                </option>
                {wards.map((ward) => (
                  <option key={ward.code} value={ward.code}>
                    {ward.name}
                  </option>
                ))}
              </select>
              {locationLoading.wards && <p className="input-hint">Đang tải danh sách phường/xã...</p>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="backgroundImg">Ảnh nền (URL Cloudinary)</label>
            <input
              type="text"
              id="backgroundImg"
              name="backgroundImg"
              value={formData.backgroundImg}
              onChange={handleChange}
              placeholder="Nếu đã có URL Cloudinary, bạn có thể dán vào đây"
            />
          </div>

          <div className="form-group">
            <label htmlFor="backgroundImgFile">Hoặc tải ảnh mới</label>
            <input
              type="file"
              id="backgroundImgFile"
              accept="image/*"
              onChange={handleImageSelect}
            />
            <p className="input-hint">
              Ảnh bạn chọn sẽ được tải lên Cloudinary và tự động dùng làm ảnh nền dãy trọ.
            </p>
            {(previewUrl || formData.backgroundImg) && (
              <img
                src={previewUrl || formData.backgroundImg}
                alt="Ảnh nền hiện tại"
                className="room-image-preview"
              />
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="totalFloors">Số tầng</label>
              <input
                type="number"
                id="totalFloors"
                name="totalFloors"
                min="1"
                value={formData.totalFloors}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="totalRooms">Tổng số phòng hiện có</label>
              <input
                type="number"
                id="totalRooms"
                name="totalRooms"
                min="0"
                value={formData.totalRooms}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả thêm</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Thông tin thêm về dãy trọ, ghi chú tiện ích chung..."
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/owner/hostels')}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || uploadingImage}
            >
              {uploadingImage ? 'Đang tải ảnh...' : loading ? 'Đang cập nhật...' : 'Cập Nhật Dãy Trọ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditHostel




