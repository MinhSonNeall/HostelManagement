import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, type AdminHostel } from '../../api/admin'
import { useNotification } from '../../contexts/NotificationContext'
import './AdminHostels.css'

const AdminHostels = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [hostels, setHostels] = useState<AdminHostel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHostels()
  }, [])

  const loadHostels = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getAllHostels()
      setHostels(data)
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách nhà trọ:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/login')
      } else {
        showNotification('Lỗi khi tải danh sách nhà trọ', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (hostelId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhà trọ này? Hành động này không thể hoàn tác.')) {
      return
    }

    try {
      await adminApi.deleteHostel(hostelId)
      showNotification('Xóa nhà trọ thành công', 'success')
      loadHostels()
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Lỗi khi xóa nhà trọ', 'error')
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  if (loading) {
    return (
      <div className="admin-hostels-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  }

  return (
    <div className="admin-hostels">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
          ← Quay lại
        </button>
        <h1>Quản lý nhà trọ</h1>
      </div>

      <div className="hostels-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên nhà trọ</th>
              <th>Chủ sở hữu ID</th>
              <th>Địa chỉ</th>
              <th>Phường/Xã</th>
              <th>Quận/Huyện</th>
              <th>Thành phố</th>
              <th>Số tầng</th>
              <th>Số phòng</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {hostels.map((hostel) => (
              <tr key={hostel.hostelId}>
                <td>{hostel.hostelId}</td>
                <td className="hostel-name">{hostel.hostelName}</td>
                <td>{hostel.ownerId}</td>
                <td className="address-cell">{hostel.address}</td>
                <td>{hostel.ward || '-'}</td>
                <td>{hostel.district || '-'}</td>
                <td>{hostel.city || '-'}</td>
                <td>{hostel.totalFloors}</td>
                <td>{hostel.totalRooms}</td>
                <td>{formatDate(hostel.createdAt)}</td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(hostel.hostelId)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {hostels.length === 0 && (
          <p className="empty-state">Chưa có nhà trọ nào</p>
        )}
      </div>
    </div>
  )
}

export default AdminHostels

