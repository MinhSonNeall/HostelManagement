import './Login.css'

const Login = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Xử lý đăng nhập sẽ được thêm sau
    console.log('Login form submitted')
  }

  return (
    <div className="login">
      <div className="login-container">
        <h1>Đăng Nhập</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Nhập tên đăng nhập"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          <button type="submit" className="login-button">
            Đăng Nhập
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

