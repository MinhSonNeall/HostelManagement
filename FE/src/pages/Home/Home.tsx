import './Home.css'

const Home = () => {
  return (
    <div className="home">
      <h1>Chào mừng đến với hệ thống Quản Lý Trọ</h1>
      <div className="home-content">
        <div className="home-card">
          <h2>Quản Lý Phòng Trọ</h2>
          <p>Quản lý thông tin các phòng trọ, tình trạng phòng và giá thuê</p>
        </div>
        <div className="home-card">
          <h2>Quản Lý Khách Thuê</h2>
          <p>Theo dõi thông tin khách thuê, hợp đồng và thanh toán</p>
        </div>
        <div className="home-card">
          <h2>Báo Cáo & Thống Kê</h2>
          <p>Xem các báo cáo về doanh thu, tình trạng phòng và khách thuê</p>
        </div>
      </div>
    </div>
  )
}

export default Home

