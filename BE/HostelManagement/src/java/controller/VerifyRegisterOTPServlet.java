package controller;

import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import model.User;
import service.AuthService;
import service.UserService;
import util.JSONHelper;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/auth/verify-register-otp")
public class VerifyRegisterOTPServlet extends HttpServlet {
    
    private static final long serialVersionUID = 1L;
    private UserService userService;
    private AuthService authService;
    
    @Override
    public void init() throws ServletException {
        super.init();
        userService = new UserService();
        authService = new AuthService();
    }
    
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        // CORS headers được xử lý bởi CorsFilter
        
        PrintWriter out = response.getWriter();
        
        try {
            JsonObject json = JSONHelper.parseJSONRequest(request);
            String email = json.has("email") && !json.get("email").isJsonNull()
                    ? json.get("email").getAsString()
                    : null;
            String otp = json.has("otp") && !json.get("otp").isJsonNull()
                    ? json.get("otp").getAsString()
                    : null;
            
            if (email == null || email.trim().isEmpty() || otp == null || otp.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Email và OTP không được để trống");
                error.put("success", false);
                out.print(JSONHelper.toJSON(error));
                out.flush();
                return;
            }
            
            // Lấy thông tin từ session
            HttpSession session = request.getSession(false);
            if (session == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Session không tồn tại. Vui lòng đăng ký lại.");
                error.put("success", false);
                out.print(JSONHelper.toJSON(error));
                out.flush();
                return;
            }
            
            String sessionKey = "register_" + email;
            String storedOTP = (String) session.getAttribute(sessionKey + "_otp");
            Long expiry = (Long) session.getAttribute(sessionKey + "_expiry");
            
            // Kiểm tra OTP có tồn tại không
            if (storedOTP == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> error = new HashMap<>();
                error.put("message", "OTP không hợp lệ hoặc đã hết hạn. Vui lòng đăng ký lại.");
                error.put("success", false);
                out.print(JSONHelper.toJSON(error));
                out.flush();
                return;
            }
            
            // Kiểm tra OTP đã hết hạn chưa
            if (expiry == null || System.currentTimeMillis() > expiry) {
                // Xóa session
                session.removeAttribute(sessionKey + "_fullName");
                session.removeAttribute(sessionKey + "_email");
                session.removeAttribute(sessionKey + "_phoneNumber");
                session.removeAttribute(sessionKey + "_password");
                session.removeAttribute(sessionKey + "_role");
                session.removeAttribute(sessionKey + "_otp");
                session.removeAttribute(sessionKey + "_expiry");
                
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> error = new HashMap<>();
                error.put("message", "OTP đã hết hạn. Vui lòng đăng ký lại.");
                error.put("success", false);
                out.print(JSONHelper.toJSON(error));
                out.flush();
                return;
            }
            
            // Kiểm tra OTP có khớp không
            if (!storedOTP.equals(otp)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> error = new HashMap<>();
                error.put("message", "OTP không đúng. Vui lòng thử lại.");
                error.put("success", false);
                out.print(JSONHelper.toJSON(error));
                out.flush();
                return;
            }
            
            // OTP đúng, tạo user
            String fullName = (String) session.getAttribute(sessionKey + "_fullName");
            String phoneNumber = (String) session.getAttribute(sessionKey + "_phoneNumber");
            String passwordHash = (String) session.getAttribute(sessionKey + "_password");
            String role = (String) session.getAttribute(sessionKey + "_role");
            
            // Kiểm tra lại email đã tồn tại chưa (tránh race condition)
            if (userService.findByEmailOrPhone(email) != null) {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Email đã tồn tại");
                error.put("success", false);
                out.print(JSONHelper.toJSON(error));
                out.flush();
                return;
            }
            
            // Tạo user
            User user = new User();
            user.setFullName(fullName);
            user.setEmail(email);
            user.setPhoneNumber(phoneNumber != null ? phoneNumber : "");
            user.setPassword(passwordHash);
            user.setRole(role != null ? role : "GUEST");
            user.setBalance(0.0);
            user.setIsActive(true);
            
            User created = userService.create(user);
            if (created == null) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Không tạo được user");
                error.put("success", false);
                out.print(JSONHelper.toJSON(error));
                out.flush();
                return;
            }
            
            // Xóa session sau khi tạo user thành công
            session.removeAttribute(sessionKey + "_fullName");
            session.removeAttribute(sessionKey + "_email");
            session.removeAttribute(sessionKey + "_phoneNumber");
            session.removeAttribute(sessionKey + "_password");
            session.removeAttribute(sessionKey + "_role");
            session.removeAttribute(sessionKey + "_otp");
            session.removeAttribute(sessionKey + "_expiry");
            
            // Trả về user đã tạo
            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("message", "Đăng ký thành công!");
            successResponse.put("success", true);
            successResponse.put("user", created);
            
            response.setStatus(HttpServletResponse.SC_CREATED);
            out.print(JSONHelper.toJSON(successResponse));
            out.flush();
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Lỗi server: " + e.getMessage());
            error.put("success", false);
            out.print(JSONHelper.toJSON(error));
            out.flush();
            e.printStackTrace();
        }
    }
    
    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        // CORS headers được xử lý bởi CorsFilter
        response.setStatus(HttpServletResponse.SC_OK);
    }
}

