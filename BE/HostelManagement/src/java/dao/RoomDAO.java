package dao;

import config.DBContext;
import model.Room;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class RoomDAO {
    
    public Room findById(int id) {
        String sql = "SELECT * FROM Rooms WHERE RoomId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToRoom(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
    
    public List<Room> findAll() {
        List<Room> rooms = new ArrayList<>();
        String sql = "SELECT * FROM Rooms";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                rooms.add(mapResultSetToRoom(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return rooms;
    }
    
    public List<Room> findByHostelId(int hostelId) {
        List<Room> rooms = new ArrayList<>();
        String sql = "SELECT * FROM Rooms WHERE HostelId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, hostelId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    rooms.add(mapResultSetToRoom(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return rooms;
    }
    
    public List<Room> findByStatus(String status) {
        List<Room> rooms = new ArrayList<>();
        String sql = "SELECT * FROM Rooms WHERE RoomStatus = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    rooms.add(mapResultSetToRoom(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return rooms;
    }
    
    public int create(Room room) {
        String sql = "INSERT INTO Rooms (HostelId, RoomNumber, Floor, AreaM2, PricePerMonth, DepositAmount, MaxOccupants, ElectricityPricePerKwh, WaterPricePerM3, WifiFee, ParkingFee, RoomStatus, HasAirConditioner, HasWaterHeater, HasPrivateBathroom, HasKitchen, AllowPet, Description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, room.getHostelId());
            stmt.setString(2, room.getRoomNumber());
            stmt.setInt(3, room.getFloor());
            stmt.setDouble(4, room.getAreaM2());
            stmt.setDouble(5, room.getPricePerMonth());
            stmt.setDouble(6, room.getDepositAmount());
            stmt.setInt(7, room.getMaxOccupants());
            stmt.setDouble(8, room.getElectricityPricePerKwh());
            stmt.setDouble(9, room.getWaterPricePerM3());
            stmt.setDouble(10, room.getWifiFee());
            stmt.setDouble(11, room.getParkingFee());
            stmt.setString(12, room.getRoomStatus());
            stmt.setBoolean(13, room.isHasAirConditioner());
            stmt.setBoolean(14, room.isHasWaterHeater());
            stmt.setBoolean(15, room.isHasPrivateBathroom());
            stmt.setBoolean(16, room.isHasKitchen());
            stmt.setBoolean(17, room.isAllowPet());
            stmt.setString(18, room.getDescription());
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
    
    public boolean update(Room room) {
        String sql = "UPDATE Rooms SET HostelId = ?, RoomNumber = ?, Floor = ?, AreaM2 = ?, PricePerMonth = ?, DepositAmount = ?, MaxOccupants = ?, ElectricityPricePerKwh = ?, WaterPricePerM3 = ?, WifiFee = ?, ParkingFee = ?, RoomStatus = ?, HasAirConditioner = ?, HasWaterHeater = ?, HasPrivateBathroom = ?, HasKitchen = ?, AllowPet = ?, Description = ?, UpdatedAt = SYSDATETIME() WHERE RoomId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, room.getHostelId());
            stmt.setString(2, room.getRoomNumber());
            stmt.setInt(3, room.getFloor());
            stmt.setDouble(4, room.getAreaM2());
            stmt.setDouble(5, room.getPricePerMonth());
            stmt.setDouble(6, room.getDepositAmount());
            stmt.setInt(7, room.getMaxOccupants());
            stmt.setDouble(8, room.getElectricityPricePerKwh());
            stmt.setDouble(9, room.getWaterPricePerM3());
            stmt.setDouble(10, room.getWifiFee());
            stmt.setDouble(11, room.getParkingFee());
            stmt.setString(12, room.getRoomStatus());
            stmt.setBoolean(13, room.isHasAirConditioner());
            stmt.setBoolean(14, room.isHasWaterHeater());
            stmt.setBoolean(15, room.isHasPrivateBathroom());
            stmt.setBoolean(16, room.isHasKitchen());
            stmt.setBoolean(17, room.isAllowPet());
            stmt.setString(18, room.getDescription());
            stmt.setInt(19, room.getRoomId());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    
    public boolean delete(int id) {
        String sql = "DELETE FROM Rooms WHERE RoomId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
    
    private Room mapResultSetToRoom(ResultSet rs) throws SQLException {
        Room room = new Room();
        room.setRoomId(rs.getInt("RoomId"));
        room.setHostelId(rs.getInt("HostelId"));
        room.setRoomNumber(rs.getString("RoomNumber"));
        room.setFloor(rs.getInt("Floor"));
        room.setAreaM2(rs.getDouble("AreaM2"));
        room.setPricePerMonth(rs.getDouble("PricePerMonth"));
        room.setDepositAmount(rs.getDouble("DepositAmount"));
        room.setMaxOccupants(rs.getInt("MaxOccupants"));
        room.setElectricityPricePerKwh(rs.getDouble("ElectricityPricePerKwh"));
        room.setWaterPricePerM3(rs.getDouble("WaterPricePerM3"));
        room.setWifiFee(rs.getDouble("WifiFee"));
        room.setParkingFee(rs.getDouble("ParkingFee"));
        room.setRoomStatus(rs.getString("RoomStatus"));
        room.setHasAirConditioner(rs.getBoolean("HasAirConditioner"));
        room.setHasWaterHeater(rs.getBoolean("HasWaterHeater"));
        room.setHasPrivateBathroom(rs.getBoolean("HasPrivateBathroom"));
        room.setHasKitchen(rs.getBoolean("HasKitchen"));
        room.setAllowPet(rs.getBoolean("AllowPet"));
        room.setDescription(rs.getString("Description"));
        room.setCreatedAt(rs.getTimestamp("CreatedAt"));
        room.setUpdatedAt(rs.getTimestamp("UpdatedAt"));
        return room;
    }
}


