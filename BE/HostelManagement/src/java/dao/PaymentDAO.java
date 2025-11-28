package dao;

import util.DBContext;
import model.Payment;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PaymentDAO {
    
    public Payment findById(int id) {
        String sql = "SELECT * FROM Payments WHERE PaymentId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToPayment(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
    
    public List<Payment> findAll() {
        List<Payment> payments = new ArrayList<>();
        String sql = "SELECT * FROM Payments";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                payments.add(mapResultSetToPayment(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return payments;
    }
    
    public List<Payment> findByBookingId(int bookingId) {
        List<Payment> payments = new ArrayList<>();
        String sql = "SELECT * FROM Payments WHERE BookingId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, bookingId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    payments.add(mapResultSetToPayment(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return payments;
    }
    
    public int create(Payment payment) {
        String sql = "INSERT INTO Payments (BookingId, Amount, PaymentMethod, Note, Status) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, payment.getBookingId());
            stmt.setDouble(2, payment.getAmount());
            stmt.setString(3, payment.getPaymentMethod());
            stmt.setString(4, payment.getNote());
            stmt.setString(5, payment.getStatus());
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
    
    public boolean update(Payment payment) {
        String sql = "UPDATE Payments SET BookingId = ?, Amount = ?, PaymentMethod = ?, Note = ?, Status = ? WHERE PaymentId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, payment.getBookingId());
            stmt.setDouble(2, payment.getAmount());
            stmt.setString(3, payment.getPaymentMethod());
            stmt.setString(4, payment.getNote());
            stmt.setString(5, payment.getStatus());
            stmt.setInt(6, payment.getPaymentId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    
    public boolean delete(int id) {
        String sql = "DELETE FROM Payments WHERE PaymentId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    
    public boolean updateStatus(int paymentId, String status) {
        String sql = "UPDATE Payments SET Status = ? WHERE PaymentId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status);
            stmt.setInt(2, paymentId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    
    private Payment mapResultSetToPayment(ResultSet rs) throws SQLException {
        Payment payment = new Payment();
        payment.setPaymentId(rs.getInt("PaymentId"));
        payment.setBookingId(rs.getInt("BookingId"));
        payment.setAmount(rs.getDouble("Amount"));
        payment.setPaymentMethod(rs.getString("PaymentMethod"));
        payment.setNote(rs.getString("Note"));
        payment.setStatus(rs.getString("Status"));
        payment.setCreatedAt(rs.getTimestamp("CreatedAt"));
        return payment;
    }
}


