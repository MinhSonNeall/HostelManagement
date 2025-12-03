package dao;

import model.RoomPicture;
import util.DBContext;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class RoomPictureDAO {

    public List<RoomPicture> findAll() {
        List<RoomPicture> pictures = new ArrayList<>();
        String sql = "SELECT * FROM RoomPicture";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                pictures.add(mapResultSetToRoomPicture(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return pictures;
    }

    public RoomPicture findById(int id) {
        String sql = "SELECT * FROM RoomPicture WHERE PictureId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, id);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToRoomPicture(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<RoomPicture> findByRoomId(int roomId) {
        List<RoomPicture> pictures = new ArrayList<>();
        String sql = "SELECT * FROM RoomPicture WHERE RoomId = ? ORDER BY DisplayOrder ASC, PictureId ASC";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, roomId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    pictures.add(mapResultSetToRoomPicture(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return pictures;
    }

    public RoomPicture findPrimaryByRoomId(int roomId) {
        String sql = "SELECT TOP 1 * FROM RoomPicture WHERE RoomId = ? AND IsPrimary = 1";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, roomId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapResultSetToRoomPicture(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public int create(RoomPicture picture) {
        String sql = "INSERT INTO RoomPicture (RoomId, PictureUrl, PictureDescription, IsPrimary, DisplayOrder) VALUES (?, ?, ?, ?, ?)";
        Connection conn = null;
        try {
            conn = DBContext.getConnection();
            conn.setAutoCommit(false);

            if (picture.isPrimary()) {
                clearPrimaryForRoom(conn, picture.getRoomId(), null);
            }

            try (PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                stmt.setInt(1, picture.getRoomId());
                stmt.setString(2, picture.getPictureUrl());
                stmt.setString(3, picture.getPictureDescription());
                stmt.setBoolean(4, picture.isPrimary());
                stmt.setInt(5, picture.getDisplayOrder());
                stmt.executeUpdate();

                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        conn.commit();
                        return rs.getInt(1);
                    }
                }
            }
            conn.rollback();
        } catch (SQLException e) {
            rollbackQuietly(conn);
            e.printStackTrace();
        } finally {
            closeQuietly(conn);
        }
        return -1;
    }

    public boolean update(RoomPicture picture) {
        String sql = "UPDATE RoomPicture SET PictureUrl = ?, PictureDescription = ?, IsPrimary = ?, DisplayOrder = ?, UpdatedAt = SYSDATETIME() WHERE PictureId = ?";
        Connection conn = null;
        try {
            conn = DBContext.getConnection();
            conn.setAutoCommit(false);

            if (picture.isPrimary()) {
                clearPrimaryForRoom(conn, picture.getRoomId(), picture.getPictureId());
            }

            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, picture.getPictureUrl());
                stmt.setString(2, picture.getPictureDescription());
                stmt.setBoolean(3, picture.isPrimary());
                stmt.setInt(4, picture.getDisplayOrder());
                stmt.setInt(5, picture.getPictureId());
                boolean updated = stmt.executeUpdate() > 0;
                conn.commit();
                return updated;
            }
        } catch (SQLException e) {
            rollbackQuietly(conn);
            e.printStackTrace();
        } finally {
            closeQuietly(conn);
        }
        return false;
    }

    public boolean delete(int pictureId) {
        String sql = "DELETE FROM RoomPicture WHERE PictureId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, pictureId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deleteByRoomId(int roomId) {
        String sql = "DELETE FROM RoomPicture WHERE RoomId = ?";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, roomId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean setPrimary(int pictureId) {
        RoomPicture target = findById(pictureId);
        if (target == null) {
            return false;
        }
        Connection conn = null;
        try {
            conn = DBContext.getConnection();
            conn.setAutoCommit(false);
            clearPrimaryForRoom(conn, target.getRoomId(), pictureId);

            String sql = "UPDATE RoomPicture SET IsPrimary = 1, UpdatedAt = SYSDATETIME() WHERE PictureId = ?";
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setInt(1, pictureId);
                boolean updated = stmt.executeUpdate() > 0;
                conn.commit();
                return updated;
            }
        } catch (SQLException e) {
            rollbackQuietly(conn);
            e.printStackTrace();
        } finally {
            closeQuietly(conn);
        }
        return false;
    }

    private void clearPrimaryForRoom(Connection conn, int roomId, Integer excludePictureId) throws SQLException {
        String sql = "UPDATE RoomPicture SET IsPrimary = 0 WHERE RoomId = ?" +
                (excludePictureId != null ? " AND PictureId <> ?" : "");
        try (PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, roomId);
            if (excludePictureId != null) {
                stmt.setInt(2, excludePictureId);
            }
            stmt.executeUpdate();
        }
    }

    private RoomPicture mapResultSetToRoomPicture(ResultSet rs) throws SQLException {
        RoomPicture picture = new RoomPicture();
        picture.setPictureId(rs.getInt("PictureId"));
        picture.setRoomId(rs.getInt("RoomId"));
        picture.setPictureUrl(rs.getString("PictureUrl"));
        picture.setPictureDescription(rs.getString("PictureDescription"));
        picture.setPrimary(rs.getBoolean("IsPrimary"));
        picture.setDisplayOrder(rs.getInt("DisplayOrder"));
        picture.setCreatedAt(rs.getTimestamp("CreatedAt"));
        picture.setUpdatedAt(rs.getTimestamp("UpdatedAt"));
        return picture;
    }

    private void rollbackQuietly(Connection conn) {
        if (conn != null) {
            try {
                conn.rollback();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }

    private void closeQuietly(Connection conn) {
        if (conn != null) {
            try {
                conn.setAutoCommit(true);
                conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}


