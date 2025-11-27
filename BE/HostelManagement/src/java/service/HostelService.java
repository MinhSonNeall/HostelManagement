package service;

import dao.HostelDAO;
import model.Hostel;
import java.util.List;

public class HostelService {
    private HostelDAO hostelDAO;

    public HostelService() {
        this.hostelDAO = new HostelDAO();
    }

    public List<Hostel> findAll() {
        return hostelDAO.findAll();
    }

    public Hostel findById(Integer hostelId) {
        return hostelDAO.findById(hostelId);
    }

    public List<Hostel> findByOwnerId(Integer ownerId) {
        return hostelDAO.findByOwnerId(ownerId);
    }

    public Hostel create(Hostel hostel) {
        int id = hostelDAO.create(hostel);
        if (id > 0) {
            hostel.setHostelId(id);
            return hostel;
        }
        return null;
    }

    public boolean update(Hostel hostel) {
        return hostelDAO.update(hostel);
    }

    public boolean delete(Integer hostelId) {
        return hostelDAO.delete(hostelId);
    }
}


