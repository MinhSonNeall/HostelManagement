package service;

import dao.UserDAO;
import dao.ReviewDAO;
import dao.HostelDAO;
import model.User;
import model.Review;
import model.Hostel;
import java.util.List;

public class AdminService {
    private final UserDAO userDAO = new UserDAO();
    private final ReviewDAO reviewDAO = new ReviewDAO();
    private final HostelDAO hostelDAO = new HostelDAO();
    private final AuthService authService = new AuthService();

    // Check if user is admin
    public boolean isAdmin(String userId) {
        if (userId == null) return false;
        User user = userDAO.findById(Integer.parseInt(userId));
        return user != null && "ADMIN".equals(user.getRole());
    }

    // User management methods
    public List<User> getAllUsers() {
        return userDAO.findAll();
    }

    public User getUserById(int userId) {
        return userDAO.findById(userId);
    }

    public boolean updateUser(User user) {
        return userDAO.update(user);
    }

    public boolean updateUserPassword(int userId, String newPassword) {
        String hashedPassword = authService.hashPassword(newPassword);
        return userDAO.updatePassword(userId, hashedPassword);
    }

    public boolean activateUser(int userId) {
        return userDAO.updateActiveStatus(userId, true);
    }

    public boolean deactivateUser(int userId) {
        return userDAO.updateActiveStatus(userId, false);
    }

    // Review/Comment management methods
    public List<Review> getAllReviews() {
        return reviewDAO.findAll();
    }

    public Review getReviewById(int reviewId) {
        return reviewDAO.findById(reviewId);
    }

    public boolean deleteReview(int reviewId) {
        return reviewDAO.delete(reviewId);
    }

    // Hostel/Post management methods
    public List<Hostel> getAllHostels() {
        return hostelDAO.findAll();
    }

    public Hostel getHostelById(int hostelId) {
        return hostelDAO.findById(hostelId);
    }

    public boolean deleteHostel(int hostelId) {
        return hostelDAO.delete(hostelId);
    }
}

