package service;

import dao.UserDAO;
import model.User;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

public class AuthService {

    private final UserDAO userDAO = new UserDAO();

    public User authenticate(String username, String password) {
        if (username == null || password == null) {
            return null;
        }

        User user = userDAO.findByEmailOrPhone(username);
        if (user == null) {
            return null;
        }

        if (!verifyPassword(password, user.getPassword())) {
            return null;
        }

        return user;
    }

    public String hashPassword(String rawPassword) {
        if (rawPassword == null) return null;

        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(rawPassword.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(digest);
        } catch (NoSuchAlgorithmException e) {
            // Thực tế gần như không xảy ra
            throw new RuntimeException("SHA-256 not available", e);
        }
    }

    private boolean verifyPassword(String inputPassword, String storedPasswordHash) {
        if (inputPassword == null || storedPasswordHash == null) {
            return false;
        }

        String inputHash = hashPassword(inputPassword);

        if (storedPasswordHash.equals(inputHash)) {
            return true;
        }

        return storedPasswordHash.equals(inputPassword);
    }

    public String generateToken(User user) {
        long now = System.currentTimeMillis();
        String payload = user.getId() + ":" + user.getRole() + ":" + now;
        return Base64.getEncoder()
                     .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
    }

    public boolean validateToken(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }

        try {
            String payload = new String(
                    Base64.getDecoder().decode(token),
                    StandardCharsets.UTF_8
            );
            String[] parts = payload.split(":");
            if (parts.length != 3) {
                return false;
            }

            long createdAt = Long.parseLong(parts[2]);
            long now = System.currentTimeMillis();

            long maxAgeMs = 24L * 60 * 60 * 1000;
            return now - createdAt <= maxAgeMs;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public String getUserIdFromToken(String token) {
        if (!validateToken(token)) {
            return null;
        }
        String payload = new String(
                Base64.getDecoder().decode(token),
                StandardCharsets.UTF_8
        );
        String[] parts = payload.split(":");
        return parts[0];
    }
}
