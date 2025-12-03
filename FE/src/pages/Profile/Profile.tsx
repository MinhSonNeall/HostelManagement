import './Profile.css'
import { useAuth } from '../../contexts/AuthContext'
import { UserRole } from '../../types'

const roleLabelMap: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Quản trị viên',
  [UserRole.HOSTELOWNER]: 'Chủ trọ',
  [UserRole.HOSTEL_OWNER]: 'Chủ trọ',
  [UserRole.GUEST]: 'Người thuê trọ',
  [UserRole.CUSTOMER]: 'Khách hàng',
}

const Profile = () => {
  const { user } = useAuth()

  if (!user) {
    return null
  }

  const initial = (user.fullName || user.username || 'U').charAt(0).toUpperCase()
  const roleLabel = roleLabelMap[user.role] ?? user.role

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <span>{initial}</span>
          </div>
          <div className="profile-main-info">
            <h1>{user.fullName || user.username}</h1>
            <p className="profile-role">{roleLabel}</p>
          </div>
        </div>

        <div className="profile-section">
          <h2>Thông tin tài khoản</h2>
          <div className="profile-grid">
            <div className="profile-item">
              <span className="label">ID người dùng</span>
              <span className="value">#{user.id}</span>
            </div>
            <div className="profile-item">
              <span className="label">Tên đăng nhập</span>
              <span className="value">{user.username}</span>
            </div>
            {user.email && (
              <div className="profile-item">
                <span className="label">Email</span>
                <span className="value">{user.email}</span>
              </div>
            )}
            <div className="profile-item">
              <span className="label">Trạng thái</span>
              <span className={`status-pill ${user.isActive === false ? 'inactive' : 'active'}`}>
                {user.isActive === false ? 'Vô hiệu hóa' : 'Đang hoạt động'}
              </span>
            </div>
          </div>
        </div>

        {user.balance !== undefined && (
          <div className="profile-section">
            <h2>Thông tin ví</h2>
            <div className="profile-wallet">
              <div className="wallet-amount">
                <span className="wallet-label">Số dư hiện tại</span>
                <span className="wallet-value">
                  {user.balance.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
              </div>
              <p className="wallet-note">
                Số dư này được sử dụng để thanh toán các khoản phí liên quan đến thuê trọ (nếu có).
              </p>
            </div>
          </div>
        )}

        <div className="profile-section">
          <h2>Bảo mật & Đăng nhập</h2>
          <p className="profile-note">
            Nếu bạn muốn thay đổi mật khẩu, vui lòng sử dụng chức năng đổi mật khẩu trong trang quản lý tài khoản
            hoặc liên hệ quản trị viên để được hỗ trợ.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Profile


