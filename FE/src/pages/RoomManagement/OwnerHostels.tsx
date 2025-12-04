import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { hostelApi } from '../../api/hostels'
import { useAuth } from '../../contexts/AuthContext'
import { useNotification } from '../../contexts/NotificationContext'
import type { Hostel } from '../../types'
import './RoomManagement.css'
import './OwnerHostels.css'

const OwnerHostels = () => {
  const { user } = useAuth()
  const ownerId = Number(user?.id)
  const { showNotification } = useNotification()
  const navigate = useNavigate()

  const [hostels, setHostels] = useState<Hostel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingHostelId, setDeletingHostelId] = useState<number | null>(null)
  const placeholderCover = useMemo(
    () =>
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=60',
    []
  )

  useEffect(() => {
    if (ownerId) {
      loadHostels()
    } else {
      setLoading(false)
    }
  }, [ownerId])

  const loadHostels = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await hostelApi.getByOwner(ownerId)
      setHostels(data)
    } catch (err) {
      setError('Không thể tải danh sách dãy trọ. Vui lòng thử lại sau.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoom = (hostelId: number) => {
    navigate(`/owner/rooms/create?hostelId=${hostelId}`)
  }

  const handleCreateHostel = () => navigate('/owner/hostels/create')

  const handleEditHostel = (hostelId: number) => {
    navigate(`/owner/hostels/${hostelId}/edit`)
  }

  const handleDeleteHostel = async (hostelId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa dãy trọ này? Hành động không thể hoàn tác.')) {
      return
    }
    try {
      setDeletingHostelId(hostelId)
      await hostelApi.remove(hostelId)
      showNotification('Đã xóa dãy trọ.', 'info')
      await loadHostels()
    } catch (err: any) {
      showNotification(err?.response?.data?.message || 'Không thể xóa dãy trọ.', 'error')
    } finally {
      setDeletingHostelId(null)
    }
  }

  if (loading) {
    return (
      <div className="room-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách dãy trọ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="room-management">
      <div className="room-management-header">
        <h1>Dãy Trọ Của Tôi</h1>
        <div className="header-actions">
          <button className="btn-create" onClick={handleCreateHostel}>
            + Thêm Dãy Trọ
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button className="btn-retry" onClick={loadHostels}>
            Thử lại
          </button>
        </div>
      )}

      {hostels.length === 0 && !error ? (
        <div className="empty-state">
          <h3>Bạn chưa có dãy trọ nào</h3>
          <p>Tạo dãy trọ đầu tiên để bắt đầu quản lý phòng.</p>
          <div className="empty-actions">
            <button className="btn-create" onClick={handleCreateHostel}>
              + Tạo Dãy Trọ
            </button>
          </div>
        </div>
      ) : (
        <div className="hostel-grid">
          {hostels.map((hostel) => {
            const coverImg = hostel.backgroundImg || placeholderCover
            const locationParts = [hostel.ward, hostel.district, hostel.city].filter(Boolean)
            return (
              <article key={hostel.hostelId} className="hostel-card">
                <div className="hostel-card-media">
                  <img src={coverImg} alt={hostel.hostelName} loading="lazy" />
                  <div className="hostel-card-badges">
                <span>{hostel.totalFloors} tầng</span>
                <span>{hostel.totalRooms} phòng</span>
                  </div>
                </div>

                <div className="hostel-card-body">
                  <div className="hostel-card-title">
                    <div>
                      <p className="hostel-id">#{hostel.hostelId}</p>
                      <h2>{hostel.hostelName}</h2>
                    </div>
                    {locationParts.length > 0 && (
                      <span className="hostel-location-chip">{locationParts.join(', ')}</span>
                    )}
                  </div>

                  <p className="hostel-card-address">{hostel.address}</p>

                  {hostel.description && (
                    <p className="hostel-card-description">{hostel.description}</p>
                  )}

                  <div className="hostel-card-stats">
                    <div>
                      <span className="stat-label">Tầng</span>
                      <strong>{hostel.totalFloors}</strong>
                    </div>
                    <div>
                      <span className="stat-label">Phòng</span>
                      <strong>{hostel.totalRooms}</strong>
                    </div>
                    <div>
                      <span className="stat-label">Địa điểm</span>
                      <strong>{hostel.city || 'Chưa cập nhật'}</strong>
                    </div>
              </div>

                  <div className="hostel-card-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => handleCreateRoom(hostel.hostelId)}
                    >
                  + Thêm phòng
                </button>
                    <button
                      className="btn-outline btn-ghost"
                      onClick={() =>
                        navigate('/owner/rooms', { state: { hostelId: hostel.hostelId } })
                      }
                    >
                  Quản lý phòng
                </button>
                    <button
                      className="btn-outline btn-ghost"
                      onClick={() => handleEditHostel(hostel.hostelId)}
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      className="btn-outline btn-danger"
                      onClick={() => handleDeleteHostel(hostel.hostelId)}
                      disabled={deletingHostelId === hostel.hostelId}
                    >
                      {deletingHostelId === hostel.hostelId ? 'Đang xóa...' : 'Xóa'}
                    </button>
              </div>
            </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OwnerHostels

