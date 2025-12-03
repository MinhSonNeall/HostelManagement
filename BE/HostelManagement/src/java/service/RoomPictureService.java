package service;

import dao.RoomPictureDAO;
import model.RoomPicture;

import java.util.List;

public class RoomPictureService {

    private final RoomPictureDAO roomPictureDAO = new RoomPictureDAO();

    public List<RoomPicture> findAll() {
        return roomPictureDAO.findAll();
    }

    public RoomPicture findById(int pictureId) {
        return roomPictureDAO.findById(pictureId);
    }

    public List<RoomPicture> findByRoomId(int roomId) {
        return roomPictureDAO.findByRoomId(roomId);
    }

    public RoomPicture findPrimaryByRoomId(int roomId) {
        return roomPictureDAO.findPrimaryByRoomId(roomId);
    }

    public RoomPicture create(RoomPicture picture) {
        int id = roomPictureDAO.create(picture);
        if (id > 0) {
            picture.setPictureId(id);
            return picture;
        }
        return null;
    }

    public boolean update(RoomPicture picture) {
        return roomPictureDAO.update(picture);
    }

    public boolean delete(int pictureId) {
        return roomPictureDAO.delete(pictureId);
    }

    public boolean deleteByRoomId(int roomId) {
        return roomPictureDAO.deleteByRoomId(roomId);
    }

    public boolean setPrimary(int pictureId) {
        return roomPictureDAO.setPrimary(pictureId);
    }
}


