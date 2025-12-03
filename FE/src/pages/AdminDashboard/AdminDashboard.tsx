import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, type DashboardStats } from '../../api/admin'
import './AdminDashboard.css'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getStats()
      setStats(data)
    } catch (error: any) {
      console.error('Lỗi khi tải thống kê:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Bảng Điều Khiển Quản Trị</h1>
        <p className="dashboard-subtitle">Quản lý hệ thống và người dùng</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/admin/users')}>
          <div className="stat-icon users-icon">👥</div>
          <div className="stat-content">
            <h3>Tổng số người dùng</h3>
            <p className="stat-value">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/admin/hostels')}>
          <div className="stat-icon hostels-icon">🏠</div>
          <div className="stat-content">
            <h3>Tổng số nhà trọ</h3>
            <p className="stat-value">{stats?.totalHostels || 0}</p>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/admin/reviews')}>
          <div className="stat-icon reviews-icon">💬</div>
          <div className="stat-content">
            <h3>Tổng số đánh giá</h3>
            <p className="stat-value">{stats?.totalReviews || 0}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Thao tác nhanh</h2>
        <div className="actions-grid">
          <button
            className="action-btn"
            onClick={() => navigate('/admin/users')}
          >
            <span className="action-icon">👥</span>
            <span>Quản lý tài khoản</span>
          </button>
          <button
            className="action-btn"
            onClick={() => navigate('/admin/reviews')}
          >
            <span className="action-icon">💬</span>
            <span>Quản lý đánh giá</span>
          </button>
          <button
            className="action-btn"
            onClick={() => navigate('/admin/hostels')}
          >
            <span className="action-icon">🏠</span>
            <span>Quản lý nhà trọ</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

