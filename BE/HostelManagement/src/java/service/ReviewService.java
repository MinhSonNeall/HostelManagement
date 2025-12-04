package service;

import dao.ReviewDAO;
import dao.UserDAO;
import model.Review;
import model.User;
import java.util.List;

public class ReviewService {
    private ReviewDAO reviewDAO;
    private UserDAO userDAO;

    public ReviewService() {
        this.reviewDAO = new ReviewDAO();
        this.userDAO = new UserDAO();
    }

    public List<Review> findAll() {
        List<Review> reviews = reviewDAO.findAll();
        attachCustomerInfo(reviews);
        return reviews;
    }

    public Review findById(Integer reviewId) {
        Review review = reviewDAO.findById(reviewId);
        if (review != null) {
            attachCustomerInfo(review);
        }
        return review;
    }

    public List<Review> findByRoomId(Integer roomId) {
        List<Review> reviews = reviewDAO.findByRoomId(roomId);
        attachCustomerInfo(reviews);
        return reviews;
    }

    public List<Review> findByCustomerId(Integer customerId) {
        List<Review> reviews = reviewDAO.findByCustomerId(customerId);
        attachCustomerInfo(reviews);
        return reviews;
    }

    private void attachCustomerInfo(Review review) {
        if (review == null || review.getCustomerId() == 0) {
            return;
        }
        User customer = userDAO.findById(review.getCustomerId());
        if (customer != null) {
            review.setCustomerName(customer.getFullName());
        }
    }

    private void attachCustomerInfo(List<Review> reviews) {
        if (reviews == null) {
            return;
        }
        for (Review review : reviews) {
            attachCustomerInfo(review);
        }
    }

    public Review create(Review review) {
        int id = reviewDAO.create(review);
        if (id > 0) {
            review.setReviewId(id);
            return review;
        }
        return null;
    }

    public boolean update(Review review) {
        return reviewDAO.update(review);
    }

    public boolean delete(Integer reviewId) {
        return reviewDAO.delete(reviewId);
    }
}


