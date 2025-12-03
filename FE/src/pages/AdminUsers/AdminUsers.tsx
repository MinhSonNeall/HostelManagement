import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi, type AdminUser, type UpdateUserData } from '../../api/admin'
import { useNotification } from '../../contexts/NotificationContext'
import './AdminUsers.css'

const AdminUsers = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordUserId, setPasswordUserId] = useState<number | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await adminApi.getAllUsers()
      setUsers(data)
    } catch (error: any) {
      console.error('Lỗi khi tải danh sách người dùng:', error)
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/login')
      } else {
        showNotification('Lỗi khi tải danh sách người dùng', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (user: AdminUser) => {
    setEditingUser({ ...user })
  }

  const handleSave = async () => {
    if (!editingUser) return

    try {
      const updateData: UpdateUserData = {
        fullName: editingUser.fullName,
        email: editingUser.email,
        phoneNumber: editingUser.phoneNumber,
        role: editingUser.role,
        balance: editingUser.balance,
        isActive: editingUser.isActive,
      }
      await adminApi.updateUser(parseInt(editingUser.id), updateData)
      showNotification('Cập nhật thông tin thành công', 'success')
      setEditingUser(null)
      loadUsers()
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Lỗi khi cập nhật', 'error')
    }
  }

  const handleActivate = async (userId: number) => {
    try {
      await adminApi.activateUser(userId)
      showNotification('Kích hoạt tài khoản thành công', 'success')
      loadUsers()
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Lỗi khi kích hoạt', 'error')
    }
  }

  const handleDeactivate = async (userId: number) => {
    try {
      await adminApi.deactivateUser(userId)
      showNotification('Vô hiệu hóa tài khoản thành công', 'success')
      loadUsers()
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Lỗi khi vô hiệu hóa', 'error')
    }
  }

  const handleChangePassword = async () => {
    if (!passwordUserId || !newPassword) {
      showNotification('Vui lòng nhập mật khẩu mới', 'error')
      return
    }

    try {
      await adminApi.updateUserPassword(passwordUserId, newPassword)
      showNotification('Đổi mật khẩu thành công', 'success')
      setShowPasswordModal(false)
      setNewPassword('')
      setPasswordUserId(null)
    } catch (error: any) {
      showNotification(error.response?.data?.message || 'Lỗi khi đổi mật khẩu', 'error')
    }
  }

  const openPasswordModal = (userId: number) => {
    setPasswordUserId(userId)
    setNewPassword('')
    setShowPasswordModal(true)
  }

  if (loading) {
    return (
      <div className="admin-users-loading">
        <div className="loading-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    )
  }

  return (
    <div className="admin-users">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
          ← Quay lại
        </button>
        <h1>Quản lý tài khoản</h1>
      </div>

      <div className="users-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Vai trò</th>
              <th>Số dư</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      value={editingUser.fullName}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, fullName: e.target.value })
                      }
                    />
                  ) : (
                    user.fullName
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, email: e.target.value })
                      }
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="text"
                      value={editingUser.phoneNumber || ''}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, phoneNumber: e.target.value })
                      }
                    />
                  ) : (
                    user.phoneNumber || '-'
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <select
                      value={editingUser.role}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, role: e.target.value })
                      }
                    >
                      <option value="GUEST">GUEST</option>
                      <option value="HOSTELOWNER">HOSTELOWNER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <input
                      type="number"
                      value={editingUser.balance}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, balance: parseFloat(e.target.value) })
                      }
                    />
                  ) : (
                    new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(user.balance)
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <select
                      value={editingUser.isActive ? 'true' : 'false'}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, isActive: e.target.value === 'true' })
                      }
                    >
                      <option value="true">Hoạt động</option>
                      <option value="false">Vô hiệu hóa</option>
                    </select>
                  ) : (
                    <span className={user.isActive ? 'status-active' : 'status-inactive'}>
                      {user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  )}
                </td>
                <td>
                  {editingUser?.id === user.id ? (
                    <div className="action-buttons">
                      <button className="btn-save" onClick={handleSave}>
                        Lưu
                      </button>
                      <button className="btn-cancel" onClick={() => setEditingUser(null)}>
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="action-buttons">
                      <button className="btn-edit" onClick={() => handleEdit(user)}>
                        Sửa
                      </button>
                      <button
                        className="btn-password"
                        onClick={() => openPasswordModal(parseInt(user.id))}
                      >
                        Đổi MK
                      </button>
                      {user.isActive ? (
                        <button
                          className="btn-deactivate"
                          onClick={() => handleDeactivate(parseInt(user.id))}
                        >
                          Vô hiệu
                        </button>
                      ) : (
                        <button
                          className="btn-activate"
                          onClick={() => handleActivate(parseInt(user.id))}
                        >
                          Kích hoạt
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Đổi mật khẩu</h2>
            <div className="modal-form">
              <label>
                Mật khẩu mới:
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                />
              </label>
              <div className="modal-actions">
                <button className="btn-save" onClick={handleChangePassword}>
                  Lưu
                </button>
                <button className="btn-cancel" onClick={() => setShowPasswordModal(false)}>
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers

