import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { roomApi } from '../../api/rooms'
import { tenantApi } from '../../api/tenants'
import { contractApi } from '../../api/contracts'
import type { Room, Tenant, Contract } from '../../types'
import './HostelOwnerDashboard.css'

const HostelOwnerDashboard = () => {
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [roomsData, tenantsData, contractsData] = await Promise.all([
        roomApi.getAll(),
        tenantApi.getAll(),
        contractApi.getAll(),
      ])
      setRooms(roomsData)
      setTenants(tenantsData)
      setContracts(contractsData)
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  // Tính toán thống kê
  const stats = {
    totalRooms: rooms.length,
    occupiedRooms: rooms.filter((r) => r.status === 'OCCUPIED').length,
    availableRooms: rooms.filter((r) => r.status === 'AVAILABLE').length,
    maintenanceRooms: rooms.filter((r) => r.status === 'MAINTENANCE').length,
    totalTenants: tenants.length,
    activeContracts: contracts.filter((c) => c.status === 'ACTIVE').length,
    totalRevenue: contracts
      .filter((c) => c.status === 'ACTIVE')
      .reduce((sum, c) => sum + c.monthlyRent, 0),
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'status-badge available'
      case 'OCCUPIED':
        return 'status-badge occupied'
      case 'MAINTENANCE':
        return 'status-badge maintenance'
      case 'ACTIVE':
        return 'status-badge active'
      case 'EXPIRED':
        return 'status-badge expired'
      default:
        return 'status-badge'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      AVAILABLE: 'Trống',
      OCCUPIED: 'Đã thuê',
      MAINTENANCE: 'Bảo trì',
      ACTIVE: 'Đang hoạt động',
      EXPIRED: 'Hết hạn',
      TERMINATED: 'Đã chấm dứt',
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  }

  return (
    <div className="hostel-owner-dashboard">
      <div className="dashboard-header">
        <h1>Bảng Điều Khiển Chủ Trọ</h1>
        <p className="dashboard-subtitle">Tổng quan về hoạt động quản lý trọ của bạn</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon rooms-icon">🏠</div>
          <div className="stat-content">
            <h3>Tổng số phòng</h3>
            <p className="stat-value">{stats.totalRooms}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon occupied-icon">✅</div>
          <div className="stat-content">
            <h3>Phòng đã thuê</h3>
            <p className="stat-value">{stats.occupiedRooms}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon available-icon">🟢</div>
          <div className="stat-content">
            <h3>Phòng trống</h3>
            <p className="stat-value">{stats.availableRooms}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon maintenance-icon">🔧</div>
          <div className="stat-content">
            <h3>Phòng bảo trì</h3>
            <p className="stat-value">{stats.maintenanceRooms}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon tenants-icon">👥</div>
          <div className="stat-content">
            <h3>Tổng khách thuê</h3>
            <p className="stat-value">{stats.totalTenants}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon contracts-icon">📄</div>
          <div className="stat-content">
            <h3>Hợp đồng đang hoạt động</h3>
            <p className="stat-value">{stats.activeContracts}</p>
          </div>
        </div>

        <div className="stat-card revenue-card">
          <div className="stat-icon revenue-icon">💰</div>
          <div className="stat-content">
            <h3>Tổng doanh thu/tháng</h3>
            <p className="stat-value">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Thao tác nhanh</h2>
        <div className="actions-grid">
          <button
            className="action-btn"
            onClick={() => navigate('/rooms')}
          >
            <span className="action-icon">🏠</span>
            <span>Quản lý phòng</span>
          </button>
          <button
            className="action-btn"
            onClick={() => navigate('/tenants')}
          >
            <span className="action-icon">👥</span>
            <span>Quản lý khách thuê</span>
          </button>
        </div>
      </div>

      {/* Recent Rooms */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Danh sách phòng</h2>
          <button
            className="view-all-btn"
            onClick={() => navigate('/rooms')}
          >
            Xem tất cả →
          </button>
        </div>
        <div className="rooms-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Số phòng</th>
                <th>Tầng</th>
                <th>Diện tích (m²)</th>
                <th>Giá thuê</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rooms.slice(0, 5).map((room) => (
                <tr key={room.id}>
                  <td>{room.roomNumber}</td>
                  <td>{room.floor}</td>
                  <td>{room.area}</td>
                  <td>{formatCurrency(room.price)}</td>
                  <td>
                    <span className={getStatusBadgeClass(room.status)}>
                      {getStatusLabel(room.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rooms.length === 0 && (
            <p className="empty-state">Chưa có phòng nào</p>
          )}
        </div>
      </div>

      {/* Recent Tenants */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Danh sách khách thuê</h2>
          <button
            className="view-all-btn"
            onClick={() => navigate('/tenants')}
          >
            Xem tất cả →
          </button>
        </div>
        <div className="tenants-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Phòng</th>
                <th>Ngày bắt đầu</th>
              </tr>
            </thead>
            <tbody>
              {tenants.slice(0, 5).map((tenant) => {
                const room = rooms.find((r) => r.id === tenant.roomId)
                return (
                  <tr key={tenant.id}>
                    <td>{tenant.fullName}</td>
                    <td>{tenant.phoneNumber}</td>
                    <td>{tenant.email || '-'}</td>
                    <td>{room?.roomNumber || '-'}</td>
                    <td>{tenant.startDate ? formatDate(tenant.startDate) : '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {tenants.length === 0 && (
            <p className="empty-state">Chưa có khách thuê nào</p>
          )}
        </div>
      </div>

      {/* Recent Contracts */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Hợp đồng gần đây</h2>
        </div>
        <div className="contracts-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Khách thuê</th>
                <th>Phòng</th>
                <th>Tiền thuê/tháng</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {contracts.slice(0, 5).map((contract) => {
                const tenant = tenants.find((t) => t.id === contract.tenantId)
                const room = rooms.find((r) => r.id === contract.roomId)
                return (
                  <tr key={contract.id}>
                    <td>{tenant?.fullName || '-'}</td>
                    <td>{room?.roomNumber || '-'}</td>
                    <td>{formatCurrency(contract.monthlyRent)}</td>
                    <td>{formatDate(contract.startDate)}</td>
                    <td>{formatDate(contract.endDate)}</td>
                    <td>
                      <span className={getStatusBadgeClass(contract.status)}>
                        {getStatusLabel(contract.status)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {contracts.length === 0 && (
            <p className="empty-state">Chưa có hợp đồng nào</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default HostelOwnerDashboard

