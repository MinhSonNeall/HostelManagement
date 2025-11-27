package dao;

import config.DBContext;
import model.Booking;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BookingDAO {
    
    public Booking findById(int id) {
        String sql = "SELECT * FROM Bookings WHERE BookingId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToBooking(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
    
    public List<Booking> findAll() {
        List<Booking> bookings = new ArrayList<>();
        String sql = "SELECT * FROM Bookings";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                bookings.add(mapResultSetToBooking(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return bookings;
    }
    
    public List<Booking> findByCustomerId(int customerId) {
        List<Booking> bookings = new ArrayList<>();
        String sql = "SELECT * FROM Bookings WHERE CustomerId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, customerId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    bookings.add(mapResultSetToBooking(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return bookings;
    }
    
    public List<Booking> findByRoomId(int roomId) {
        List<Booking> bookings = new ArrayList<>();
        String sql = "SELECT * FROM Bookings WHERE RoomId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, roomId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    bookings.add(mapResultSetToBooking(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return bookings;
    }
    
    public List<Booking> findByStatus(String status) {
        List<Booking> bookings = new ArrayList<>();
        String sql = "SELECT * FROM Bookings WHERE BookingStatus = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    bookings.add(mapResultSetToBooking(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return bookings;
    }
    
    public boolean updateStatus(int bookingId, String status) {
        String sql = "UPDATE Bookings SET BookingStatus = ?, UpdatedAt = SYSDATETIME() WHERE BookingId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status);
            stmt.setInt(2, bookingId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    
    public int create(Booking booking) {
        String sql = "INSERT INTO Bookings (RoomId, CustomerId, StartDate, EndDate, BookingStatus, TotalPrice) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, booking.getRoomId());
            stmt.setInt(2, booking.getCustomerId());
            stmt.setDate(3, new java.sql.Date(booking.getStartDate().getTime()));
            stmt.setDate(4, booking.getEndDate() != null ? new java.sql.Date(booking.getEndDate().getTime()) : null);
            stmt.setString(5, booking.getBookingStatus());
            stmt.setDouble(6, booking.getTotalPrice());
            stmt.executeUpdate();
            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }
    
    public boolean update(Booking booking) {
        String sql = "UPDATE Bookings SET RoomId = ?, CustomerId = ?, StartDate = ?, EndDate = ?, BookingStatus = ?, TotalPrice = ?, UpdatedAt = SYSDATETIME() WHERE BookingId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, booking.getRoomId());
            stmt.setInt(2, booking.getCustomerId());
            stmt.setDate(3, new java.sql.Date(booking.getStartDate().getTime()));
            stmt.setDate(4, booking.getEndDate() != null ? new java.sql.Date(booking.getEndDate().getTime()) : null);
            stmt.setString(5, booking.getBookingStatus());
            stmt.setDouble(6, booking.getTotalPrice());
            stmt.setInt(7, booking.getBookingId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    
    public boolean delete(int id) {
        String sql = "DELETE FROM Bookings WHERE BookingId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    
    private Booking mapResultSetToBooking(ResultSet rs) throws SQLException {
        Booking booking = new Booking();
        booking.setBookingId(rs.getInt("BookingId"));
        booking.setRoomId(rs.getInt("RoomId"));
        booking.setCustomerId(rs.getInt("CustomerId"));
        booking.setStartDate(rs.getDate("StartDate"));
        booking.setEndDate(rs.getDate("EndDate"));
        booking.setBookingStatus(rs.getString("BookingStatus"));
        booking.setTotalPrice(rs.getDouble("TotalPrice"));
        booking.setCreatedAt(rs.getTimestamp("CreatedAt"));
        booking.setUpdatedAt(rs.getTimestamp("UpdatedAt"));
        return booking;
    }
}
