package service;

import dao.ReviewDAO;
import model.Review;
import java.util.List;

public class ReviewService {
    private ReviewDAO reviewDAO;

    public ReviewService() {
        this.reviewDAO = new ReviewDAO();
    }

    public List<Review> findAll() {
        return reviewDAO.findAll();
    }

    public Review findById(Integer reviewId) {
        return reviewDAO.findById(reviewId);
    }

    public List<Review> findByRoomId(Integer roomId) {
        return reviewDAO.findByRoomId(roomId);
    }

    public List<Review> findByCustomerId(Integer customerId) {
        return reviewDAO.findByCustomerId(customerId);
    }

    public Review create(Review review) {
        return reviewDAO.create(review);
    }

    public boolean update(Review review) {
        return reviewDAO.update(review);
    }

    public boolean delete(Integer reviewId) {
        return reviewDAO.delete(reviewId);
    }
}


