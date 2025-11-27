package service;

import dao.RoomDAO;
import model.Room;
import java.util.List;

public class RoomService {
    private RoomDAO roomDAO;

    public RoomService() {
        this.roomDAO = new RoomDAO();
    }

    public List<Room> findAll() {
        return roomDAO.findAll();
    }

    public Room findById(Integer roomId) {
        return roomDAO.findById(roomId);
    }

    public List<Room> findByHostelId(Integer hostelId) {
        return roomDAO.findByHostelId(hostelId);
    }

    public List<Room> findByStatus(String status) {
        return roomDAO.findByStatus(status);
    }

    public List<Room> findAvailableRooms() {
        return roomDAO.findByStatus("AVAILABLE");
    }

    public Room create(Room room) {
        return roomDAO.create(room);
    }

    public boolean update(Room room) {
        return roomDAO.update(room);
    }

    public boolean updateStatus(Integer roomId, String status) {
        return roomDAO.updateStatus(roomId, status);
    }

    public boolean delete(Integer roomId) {
        return roomDAO.delete(roomId);
    }
}


