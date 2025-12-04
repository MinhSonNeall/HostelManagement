package controller;

import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import dao.UserDAO;
import service.AuthService;
import util.JSONHelper;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

@WebServlet("/api/auth/reset-password")
public class ResetPasswordServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private UserDAO userDAO;
    private AuthService authService;

    @Override
    public void init() throws ServletException {
        super.init();
        this.userDAO = new UserDAO();
        this.authService = new AuthService();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        // CORS headers được xử lý bởi CorsFilter
        
        PrintWriter out = response.getWriter();

        try {
            JsonObject jsonRequest = JSONHelper.parseJSONRequest(request);
            
            String email = jsonRequest.has("email") && !jsonRequest.get("email").isJsonNull()
                    ? jsonRequest.get("email").getAsString()
                    : null;
            String otp = jsonRequest.has("otp") && !jsonRequest.get("otp").isJsonNull()
                    ? jsonRequest.get("otp").getAsString()
                    : null;
            String newPassword = jsonRequest.has("password") && !jsonRequest.get("password").isJsonNull()
                    ? jsonRequest.get("password").getAsString()
                    : null;

            // Validate input
            if (email == null || email.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Email không được để trống");
                out.print(JSONHelper.toJSON(errorResponse));
                out.flush();
                return;
            }

            if (otp == null || otp.trim().isEmpty() || otp.length() != 6) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Mã OTP phải có 6 chữ số");
                out.print(JSONHelper.toJSON(errorResponse));
                out.flush();
                return;
            }

            if (newPassword == null || newPassword.trim().isEmpty() || newPassword.length() < 6) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Mật khẩu phải có ít nhất 6 ký tự");
                out.print(JSONHelper.toJSON(errorResponse));
                out.flush();
                return;
            }

            // Kiểm tra OTP từ session
            HttpSession session = request.getSession(false);
            if (session == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Session không hợp lệ. Vui lòng yêu cầu mã OTP mới");
                out.print(JSONHelper.toJSON(errorResponse));
                out.flush();
                return;
            }

            String sessionKey = "otp_" + email;
            String storedOTP = (String) session.getAttribute(sessionKey);
            Long expiryTime = (Long) session.getAttribute(sessionKey + "_expiry");
            String storedEmail = (String) session.getAttribute(sessionKey + "_email");

            // Kiểm tra OTP có tồn tại không
            if (storedOTP == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới");
                out.print(JSONHelper.toJSON(errorResponse));
                out.flush();
                return;
            }

            // Kiểm tra email có khớp không
            if (!email.equals(storedEmail)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Email không khớp với mã OTP");
                out.print(JSONHelper.toJSON(errorResponse));
                out.flush();
                return;
            }

            // Kiểm tra OTP có đúng không
            if (!otp.equals(storedOTP)) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Mã OTP không đúng");
                out.print(JSONHelper.toJSON(errorResponse));
                out.flush();
                return;
            }

            // Kiểm tra OTP đã hết hạn chưa
            if (expiryTime == null || System.currentTimeMillis() > expiryTime) {
                // Xóa session
                session.removeAttribute(sessionKey);
                session.removeAttribute(sessionKey + "_expiry");
                session.removeAttribute(sessionKey + "_email");
                
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới");
                out.print(JSONHelper.toJSON(errorResponse));
                out.flush();
                return;
            }

            // Tìm user theo email
            var user = userDAO.findByEmail(email);
            if (user == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Không tìm thấy người dùng");
                out.print(JSONHelper.toJSON(errorResponse));
                out.flush();
                return;
            }

            // Hash password mới
            String hashedPassword = authService.hashPassword(newPassword);
            
            // Cập nhật password
            boolean passwordUpdated = userDAO.updatePassword(Integer.parseInt(user.getId()), hashedPassword);
            
            if (!passwordUpdated) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Không thể cập nhật mật khẩu. Vui lòng thử lại");
                out.print(JSONHelper.toJSON(errorResponse));
                out.flush();
                return;
            }

            // Xóa OTP khỏi session sau khi đã sử dụng
            session.removeAttribute(sessionKey);
            session.removeAttribute(sessionKey + "_expiry");
            session.removeAttribute(sessionKey + "_email");

            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("message", "Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.");
            
            response.setStatus(HttpServletResponse.SC_OK);
            out.print(JSONHelper.toJSON(successResponse));
            out.flush();

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Lỗi server: " + e.getMessage());
            out.print(JSONHelper.toJSON(errorResponse));
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

