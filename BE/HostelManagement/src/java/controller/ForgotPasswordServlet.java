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
import service.EmailService;
import util.JSONHelper;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/auth/forgot-password")
public class ForgotPasswordServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private UserDAO userDAO;
    private EmailService emailService;
    
    // OTP hết hạn sau 10 phút
    private static final long OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

    @Override
    public void init() throws ServletException {
        super.init();
        this.userDAO = new UserDAO();
        this.emailService = new EmailService();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        // CORS headers được xử lý bởi CorsFilter
        
        PrintWriter out = response.getWriter();

        try {
            System.out.println("ForgotPasswordServlet: Received request");
            JsonObject jsonRequest = JSONHelper.parseJSONRequest(request);
            String email = jsonRequest.has("email") && !jsonRequest.get("email").isJsonNull()
                    ? jsonRequest.get("email").getAsString()
                    : null;
            System.out.println("ForgotPasswordServlet: Email = " + email);

            if (email == null || email.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Email không được để trống");
                out.print(JSONHelper.toJSON(errorResponse));
                out.flush();
                return;
            }

            // Tìm user theo email
            User user = userDAO.findByEmail(email);
            
            // Luôn trả về success để tránh email enumeration attack
            // Nhưng chỉ gửi email nếu user tồn tại
            boolean emailSent = false;
            if (user != null && user.getIsActive() != null && user.getIsActive()) {
                try {
                    // Tạo OTP
                    String otp = emailService.generateOTP();
                    
                    // Lưu OTP vào session với key là email
                    HttpSession session = request.getSession(true);
                    String sessionKey = "otp_" + email;
                    session.setAttribute(sessionKey, otp);
                    session.setAttribute(sessionKey + "_expiry", System.currentTimeMillis() + OTP_EXPIRY_MS);
                    session.setAttribute(sessionKey + "_email", email);
                    
                    // Gửi email và đợi kết quả (với timeout để không block quá lâu)
                    System.out.println("Sending OTP email to: " + user.getEmail());
                    emailSent = emailService.sendOTPEmail(
                        user.getEmail(),
                        otp,
                        user.getFullName() != null ? user.getFullName() : "Người dùng"
                    );
                    
                    if (emailSent) {
                        System.out.println("OTP sent successfully to: " + user.getEmail());
                    } else {
                        System.err.println("Failed to send OTP email to: " + user.getEmail());
                    }
                } catch (Exception emailException) {
                    // Log lỗi nhưng vẫn trả về success để bảo mật
                    System.err.println("Error sending OTP email: " + emailException.getMessage());
                    emailException.printStackTrace();
                }
            }

            // Trả về response sau khi đã gửi email
            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("message", "Nếu email tồn tại, bạn sẽ nhận được mã OTP trong vài phút.");
            successResponse.put("success", true);
            successResponse.put("emailSent", emailSent); // Thông tin email đã được gửi
            
            response.setStatus(HttpServletResponse.SC_OK);
            String jsonResponse = JSONHelper.toJSON(successResponse);
            System.out.println("ForgotPasswordServlet: Sending response: " + jsonResponse);
            out.print(jsonResponse);
            out.flush();
            System.out.println("ForgotPasswordServlet: Response sent successfully");

        } catch (Exception e) {
            // Đảm bảo response chưa được commit
            if (!response.isCommitted()) {
                try {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    Map<String, Object> errorResponse = new HashMap<>();
                    errorResponse.put("message", "Lỗi server: " + e.getMessage());
                    errorResponse.put("success", false);
                    String jsonResponse = JSONHelper.toJSON(errorResponse);
                    out.print(jsonResponse);
                    out.flush();
                } catch (Exception ex) {
                    System.err.println("Error writing error response: " + ex.getMessage());
                    ex.printStackTrace();
                }
            }
            System.err.println("Error in ForgotPasswordServlet: " + e.getMessage());
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

