package service;

import dao.UserDAO;
import model.User;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class AuthService {

    private final UserDAO userDAO = new UserDAO();
    // khóa bí mật để ký token – anh đổi chuỗi này thành chuỗi khác mạnh hơn
    private static final String SECRET = "change-this-secret-key";

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

    private boolean verifyPassword(String inputPassword, String storedPasswordHash) {
        if (storedPasswordHash == null) {
            return false;
        }

        String hashedInput = hashPassword(inputPassword);
        return storedPasswordHash.equals(hashedInput);
    }

    public String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Không hỗ trợ SHA-256", e);
        }
    }

    public String generateToken(User user) {
        long now = System.currentTimeMillis();
        long exp = now + 24L * 60 * 60 * 1000; // 24h

        String payload = user.getId() + "|" + user.getRole() + "|" + exp;
        String signature = hmacSha256(payload, SECRET);

        String payloadPart = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        String signPart = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(signature.getBytes(StandardCharsets.UTF_8));

        return payloadPart + "." + signPart;
    }

    public boolean validateToken(String token) {
        if (token == null || !token.contains(".")) {
            return false;
        }
        String[] parts = token.split("\\.");
        if (parts.length != 2) {
            return false;
        }

        String payload = new String(Base64.getUrlDecoder()
                .decode(parts[0]), StandardCharsets.UTF_8);
        String signFromToken = new String(Base64.getUrlDecoder()
                .decode(parts[1]), StandardCharsets.UTF_8);

        String expectedSign = hmacSha256(payload, SECRET);
        if (!expectedSign.equals(signFromToken)) {
            return false;
        }

        String[] payloadParts = payload.split("\\|");
        if (payloadParts.length != 3) {
            return false;
        }

        long exp;
        try {
            exp = Long.parseLong(payloadParts[2]);
        } catch (NumberFormatException e) {
            return false;
        }

        return exp >= System.currentTimeMillis();
    }

    public String getUserIdFromToken(String token) {
        if (token == null || !token.contains(".")) return null;
        String[] parts = token.split("\\.");
        try {
            String payload = new String(Base64.getUrlDecoder()
                    .decode(parts[0]), StandardCharsets.UTF_8);
            String[] payloadParts = payload.split("\\|");
            return payloadParts[0];
        } catch (Exception e) {
            return null;
        }
    }

    private String hmacSha256(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec keySpec =
                    new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(keySpec);
            byte[] result = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(result);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi HMAC-SHA256", e);
        }
    }
}
