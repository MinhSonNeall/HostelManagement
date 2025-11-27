package service;

import dao.BookingDAO;
import model.Booking;
import java.util.List;

public class BookingService {
    private BookingDAO bookingDAO;

    public BookingService() {
        this.bookingDAO = new BookingDAO();
    }

    public List<Booking> findAll() {
        return bookingDAO.findAll();
    }

    public Booking findById(Integer bookingId) {
        return bookingDAO.findById(bookingId);
    }

    public List<Booking> findByCustomerId(Integer customerId) {
        return bookingDAO.findByCustomerId(customerId);
    }

    public List<Booking> findByRoomId(Integer roomId) {
        return bookingDAO.findByRoomId(roomId);
    }

    public List<Booking> findByStatus(String status) {
        return bookingDAO.findByStatus(status);
    }

    public Booking create(Booking booking) {
        int id = bookingDAO.create(booking);
        if (id > 0) {
            booking.setBookingId(id);
            return booking;
        }
        return null;
    }

    public boolean update(Booking booking) {
        return bookingDAO.update(booking);
    }

    public boolean updateStatus(Integer bookingId, String status) {
        return bookingDAO.updateStatus(bookingId, status);
    }

    public boolean delete(Integer bookingId) {
        return bookingDAO.delete(bookingId);
    }
}


