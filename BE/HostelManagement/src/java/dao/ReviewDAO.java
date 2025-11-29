package dao;

import config.DBContext;
import model.Review;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ReviewDAO {
    
    public Review findById(int id) {
        String sql = "SELECT * FROM Reviews WHERE ReviewId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToReview(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
    
    public List<Review> findAll() {
        List<Review> reviews = new ArrayList<>();
        String sql = "SELECT * FROM Reviews";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                reviews.add(mapResultSetToReview(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reviews;
    }
    
    public List<Review> findByRoomId(int roomId) {
        List<Review> reviews = new ArrayList<>();
        String sql = "SELECT * FROM Reviews WHERE RoomId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, roomId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    reviews.add(mapResultSetToReview(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reviews;
    }
    
    public List<Review> findByCustomerId(int customerId) {
        List<Review> reviews = new ArrayList<>();
        String sql = "SELECT * FROM Reviews WHERE CustomerId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, customerId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    reviews.add(mapResultSetToReview(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return reviews;
    }
    
    public int create(Review review) {
        String sql = "INSERT INTO Reviews (RoomId, CustomerId, Rating, Comment) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, review.getRoomId());
            stmt.setInt(2, review.getCustomerId());
            stmt.setInt(3, review.getRating());
            stmt.setString(4, review.getComment());
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
    
    public boolean update(Review review) {
        String sql = "UPDATE Reviews SET RoomId = ?, CustomerId = ?, Rating = ?, Comment = ?, UpdatedAt = SYSDATETIME() WHERE ReviewId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, review.getRoomId());
            stmt.setInt(2, review.getCustomerId());
            stmt.setInt(3, review.getRating());
            stmt.setString(4, review.getComment());
            stmt.setInt(5, review.getReviewId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    
    public boolean delete(int id) {
        String sql = "DELETE FROM Reviews WHERE ReviewId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    
    public double getAverageRatingByRoomId(int roomId) {
        String sql = "SELECT AVG(CAST(Rating AS FLOAT)) as avgRating FROM Reviews WHERE RoomId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, roomId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble("avgRating");
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0;
    }
    
    private Review mapResultSetToReview(ResultSet rs) throws SQLException {
        Review review = new Review();
        review.setReviewId(rs.getInt("ReviewId"));
        review.setRoomId(rs.getInt("RoomId"));
        review.setCustomerId(rs.getInt("CustomerId"));
        review.setRating(rs.getInt("Rating"));
        review.setComment(rs.getString("Comment"));
        review.setCreatedAt(rs.getTimestamp("CreatedAt"));
        review.setUpdatedAt(rs.getTimestamp("UpdatedAt"));
        return review;
    }
}



