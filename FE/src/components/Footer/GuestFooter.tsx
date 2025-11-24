import './GuestFooter.css'

const GuestFooter = () => {
  return (
    <footer className="guest-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Trọ Tốt</h3>
            <p>Nền tảng kết nối chủ trọ và người tìm trọ uy tín nhất Việt Nam</p>
          </div>
          
          <div className="footer-section">
            <h4>Liên kết</h4>
            <ul>
              <li><a href="/">Trang chủ</a></li>
              <li><a href="/rooms">Tìm phòng</a></li>
              <li><a href="/about">Về chúng tôi</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Hỗ trợ</h4>
            <ul>
              <li><a href="/contact">Liên hệ</a></li>
              <li><a href="/help">Trợ giúp</a></li>
              <li><a href="/privacy">Chính sách bảo mật</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Liên hệ</h4>
            <p>📞 0123 456 789</p>
            <p>✉️ contact@trotot.com</p>
            <p>📍 123 Nguyễn Văn Linh, Hà Nội</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Trọ Tốt. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}

export default GuestFooter