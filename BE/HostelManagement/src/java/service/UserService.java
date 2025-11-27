package service;

import dao.UserDAO;
import model.User;

public class UserService {
    private UserDAO userDAO;

    public UserService() {
        this.userDAO = new UserDAO();
    }

    public User findByEmailOrPhone(String emailOrPhone) {
        return userDAO.findByEmailOrPhone(emailOrPhone);
    }

    public User findById(Integer userId) {
        return userDAO.findById(userId);
    }

    public User create(User user) {
        return userDAO.create(user);
    }

    public boolean update(User user) {
        return userDAO.update(user);
    }

    public boolean updatePassword(Integer userId, String passwordHash) {
        return userDAO.updatePassword(userId, passwordHash);
    }
}


