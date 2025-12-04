package service;

import dao.RoomDAO;
import dao.RoomPictureDAO;
import dao.HostelDAO;
import dao.UserDAO;
import model.Room;
import model.RoomPicture;
import model.Hostel;
import model.User;

import java.util.List;

public class RoomService {
    private RoomDAO roomDAO;
    private RoomPictureDAO roomPictureDAO;
    private HostelDAO hostelDAO;
    private UserDAO userDAO;

    public RoomService() {
        this.roomDAO = new RoomDAO();
        this.roomPictureDAO = new RoomPictureDAO();
        this.hostelDAO = new HostelDAO();
        this.userDAO = new UserDAO();
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

    public void attachHostelInfo(Room room) {
        if (room == null || room.getHostelId() == 0) {
            return;
        }
        Hostel hostel = hostelDAO.findById(room.getHostelId());
        if (hostel != null) {
            room.setHostelName(hostel.getHostelName());
            room.setHostelAddress(hostel.getAddress());
            room.setHostelWard(hostel.getWard());
            room.setHostelDistrict(hostel.getDistrict());
            room.setHostelCity(hostel.getCity());
            room.setHostelOwnerId(hostel.getOwnerId());

            if (hostel.getOwnerId() > 0) {
                User owner = userDAO.findById(hostel.getOwnerId());
                if (owner != null) {
                    room.setHostelOwnerName(owner.getFullName());
                    room.setHostelOwnerEmail(owner.getEmail());
                    room.setHostelOwnerPhone(owner.getPhoneNumber());
                }
            }
        }
    }

    public void attachHostelInfo(List<Room> rooms) {
        if (rooms == null) {
            return;
        }
        for (Room room : rooms) {
            attachHostelInfo(room);
        }
    }
}


