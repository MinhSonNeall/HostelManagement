package service;

import dao.RoomDAO;
import dao.RoomPictureDAO;
import model.Room;
import model.RoomPicture;

import java.util.List;

public class RoomService {
    private RoomDAO roomDAO;
    private RoomPictureDAO roomPictureDAO;

    public RoomService() {
        this.roomDAO = new RoomDAO();
        this.roomPictureDAO = new RoomPictureDAO();
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
        int id = roomDAO.create(room);
        if (id > 0) {
            room.setRoomId(id);
            return room;
        }
        return null;
    }

    public boolean update(Room room) {
        return roomDAO.update(room);
    }

    public boolean updateStatus(int roomId, String status) {
        return roomDAO.updateStatus(roomId, status);
    }

    public boolean delete(Integer roomId) {
        return roomDAO.delete(roomId);
    }

    public void attachPictures(Room room) {
        if (room == null || room.getRoomId() == 0) {
            return;
        }
        List<RoomPicture> pictures = roomPictureDAO.findByRoomId(room.getRoomId());
        room.setPictures(pictures);
        RoomPicture primary = roomPictureDAO.findPrimaryByRoomId(room.getRoomId());
        room.setPrimaryPicture(primary);
    }
}


