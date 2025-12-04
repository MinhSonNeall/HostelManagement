package controller;

import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import dao.UserDAO;
import model.User;
import service.AuthService;
import service.EmailService;
import service.UserService;
import util.JSONHelper;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/auth/register")
public class RegisterServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private UserService userService;
    private AuthService authService;
    private EmailService emailService;
    
    // OTP hết hạn sau 10 phút
    private static final long OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

    @Override
    public void init() throws ServletException {
        super.init();
        userService = new UserService();
        authService = new AuthService();
        emailService = new EmailService();
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

            String fullName = json.get("fullName").getAsString();
            String email = json.get("email").getAsString();
            String phoneNumber = json.has("phoneNumber") && !json.get("phoneNumber").isJsonNull() 
                    ? json.get("phoneNumber").getAsString() : "";
            String password = json.get("password").getAsString();
            // GUEST hoặc HOSTELOWNER, mặc định GUEST
            String role = json.has("role") ? json.get("role").getAsString() : "GUEST";

            if (fullName == null || fullName.trim().isEmpty()
                    || email == null || email.trim().isEmpty()
                    || password == null || password.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Full name, email, password không được để trống");
                error.put("success", false);
                out.print(JSONHelper.toJSON(error));
                out.flush();
                return;
            }

            // Kiểm tra email hoặc số điện thoại đã tồn tại chưa
            if (userService.findByEmailOrPhone(email) != null) {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Email đã tồn tại");
                error.put("success", false);
                out.print(JSONHelper.toJSON(error));
                out.flush();
                return;
            }
            
            if (phoneNumber != null && !phoneNumber.trim().isEmpty() 
                    && userService.findByEmailOrPhone(phoneNumber) != null) {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Số điện thoại đã tồn tại");
                error.put("success", false);
                out.print(JSONHelper.toJSON(error));
                out.flush();
                return;
            }

            // Tạo OTP
            String otp = emailService.generateOTP();
            
            // Lưu thông tin đăng ký và OTP vào session
            HttpSession session = request.getSession(true);
            String sessionKey = "register_" + email;
            session.setAttribute(sessionKey + "_fullName", fullName);
            session.setAttribute(sessionKey + "_email", email);
            session.setAttribute(sessionKey + "_phoneNumber", phoneNumber);
            session.setAttribute(sessionKey + "_password", authService.hashPassword(password));
            session.setAttribute(sessionKey + "_role", role);
            session.setAttribute(sessionKey + "_otp", otp);
            session.setAttribute(sessionKey + "_expiry", System.currentTimeMillis() + OTP_EXPIRY_MS);
            
            // Gửi email OTP
            boolean emailSent = emailService.sendRegisterOTPEmail(
                email,
                otp,
                fullName
            );
            
            Map<String, Object> responseData = new HashMap<>();
            if (emailSent) {
                responseData.put("message", "Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.");
                responseData.put("success", true);
                responseData.put("email", email);
            } else {
                responseData.put("message", "Không thể gửi email OTP. Vui lòng thử lại sau.");
                responseData.put("success", false);
            }
            
            response.setStatus(HttpServletResponse.SC_OK);
            out.print(JSONHelper.toJSON(responseData));
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
