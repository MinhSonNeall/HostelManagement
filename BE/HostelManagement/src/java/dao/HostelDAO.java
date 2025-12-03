package dao;

import util.DBContext;
import model.Hostel;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class HostelDAO {
    
    public Hostel findById(int id) {
        String sql = "SELECT * FROM Hostels WHERE HostelId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToHostel(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
    
    public List<Hostel> findAll() {
        List<Hostel> hostels = new ArrayList<>();
        String sql = "SELECT * FROM Hostels";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                hostels.add(mapResultSetToHostel(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return hostels;
    }
    
    public List<Hostel> findByOwnerId(int ownerId) {
        List<Hostel> hostels = new ArrayList<>();
        String sql = "SELECT * FROM Hostels WHERE OwnerId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, ownerId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    hostels.add(mapResultSetToHostel(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return hostels;
    }
    
    public int create(Hostel hostel) {
        String sql = "INSERT INTO Hostels (OwnerId, HostelName, Address, Ward, District, City, Description, BackgroundImg, TotalFloors, TotalRooms) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, hostel.getOwnerId());
            stmt.setString(2, hostel.getHostelName());
            stmt.setString(3, hostel.getAddress());
            stmt.setString(4, hostel.getWard());
            stmt.setString(5, hostel.getDistrict());
            stmt.setString(6, hostel.getCity());
            stmt.setString(7, hostel.getDescription());
            stmt.setString(8, hostel.getBackgroundImg());
            stmt.setInt(9, hostel.getTotalFloors());
            stmt.setInt(10, hostel.getTotalRooms());
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
    
    public boolean update(Hostel hostel) {
        String sql = "UPDATE Hostels SET HostelName = ?, Address = ?, Ward = ?, District = ?, City = ?, Description = ?, BackgroundImg = ?, TotalFloors = ?, TotalRooms = ?, UpdatedAt = SYSDATETIME() WHERE HostelId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, hostel.getHostelName());
            stmt.setString(2, hostel.getAddress());
            stmt.setString(3, hostel.getWard());
            stmt.setString(4, hostel.getDistrict());
            stmt.setString(5, hostel.getCity());
            stmt.setString(6, hostel.getDescription());
            stmt.setString(7, hostel.getBackgroundImg());
            stmt.setInt(8, hostel.getTotalFloors());
            stmt.setInt(9, hostel.getTotalRooms());
            stmt.setInt(10, hostel.getHostelId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    
    public boolean delete(int id) {
        String sql = "DELETE FROM Hostels WHERE HostelId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    
    private Hostel mapResultSetToHostel(ResultSet rs) throws SQLException {
        Hostel hostel = new Hostel();
        hostel.setHostelId(rs.getInt("HostelId"));
        hostel.setOwnerId(rs.getInt("OwnerId"));
        hostel.setHostelName(rs.getString("HostelName"));
        hostel.setAddress(rs.getString("Address"));
        hostel.setWard(rs.getString("Ward"));
        hostel.setDistrict(rs.getString("District"));
        hostel.setCity(rs.getString("City"));
        hostel.setDescription(rs.getString("Description"));
        hostel.setBackgroundImg(rs.getString("BackgroundImg"));
        hostel.setTotalFloors(rs.getInt("TotalFloors"));
        hostel.setTotalRooms(rs.getInt("TotalRooms"));
        hostel.setCreatedAt(rs.getTimestamp("CreatedAt"));
        hostel.setUpdatedAt(rs.getTimestamp("UpdatedAt"));
        return hostel;
    }
}



