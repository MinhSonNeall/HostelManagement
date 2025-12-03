package controller;

import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.User;
import model.Review;
import model.Hostel;
import service.AdminService;
import service.AuthService;
import util.JSONHelper;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.List;

@WebServlet("/api/admin/*")
public class AdminServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private AdminService adminService;
    private AuthService authService;

    @Override
    public void init() throws ServletException {
        super.init();
        adminService = new AdminService();
        authService = new AuthService();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
     
        
        PrintWriter out = response.getWriter();
        String path = request.getPathInfo();

        try {
            // Check admin authorization
            if (!checkAdminAuth(request, response)) {
                return;
            }

            if (path == null || path.equals("/")) {
                // Get dashboard stats
                Map<String, Object> stats = new HashMap<>();
                stats.put("totalUsers", adminService.getAllUsers().size());
                stats.put("totalHostels", adminService.getAllHostels().size());
                stats.put("totalReviews", adminService.getAllReviews().size());
                response.setStatus(HttpServletResponse.SC_OK);
                out.print(JSONHelper.toJSON(stats));
                out.flush();
                return;
            }

            if (path.equals("/users")) {
                List<User> users = adminService.getAllUsers();
                response.setStatus(HttpServletResponse.SC_OK);
                out.print(JSONHelper.toJSON(users));
                out.flush();
                return;
            }

            if (path.startsWith("/users/")) {
                String userIdStr = path.substring("/users/".length());
                try {
                    int userId = Integer.parseInt(userIdStr);
                    User user = adminService.getUserById(userId);
                    if (user != null) {
                        response.setStatus(HttpServletResponse.SC_OK);
                        out.print(JSONHelper.toJSON(user));
                    } else {
                        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                        Map<String, Object> error = new HashMap<>();
                        error.put("message", "Không tìm thấy người dùng");
                        out.print(JSONHelper.toJSON(error));
                    }
                } catch (NumberFormatException e) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "ID người dùng không hợp lệ");
                    out.print(JSONHelper.toJSON(error));
                }
                out.flush();
                return;
            }

            if (path.equals("/reviews")) {
                List<Review> reviews = adminService.getAllReviews();
                response.setStatus(HttpServletResponse.SC_OK);
                out.print(JSONHelper.toJSON(reviews));
                out.flush();
                return;
            }

            if (path.startsWith("/reviews/")) {
                String reviewIdStr = path.substring("/reviews/".length());
                try {
                    int reviewId = Integer.parseInt(reviewIdStr);
                    Review review = adminService.getReviewById(reviewId);
                    if (review != null) {
                        response.setStatus(HttpServletResponse.SC_OK);
                        out.print(JSONHelper.toJSON(review));
                    } else {
                        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                        Map<String, Object> error = new HashMap<>();
                        error.put("message", "Không tìm thấy đánh giá");
                        out.print(JSONHelper.toJSON(error));
                    }
                } catch (NumberFormatException e) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "ID đánh giá không hợp lệ");
                    out.print(JSONHelper.toJSON(error));
                }
                out.flush();
                return;
            }

            if (path.equals("/hostels")) {
                List<Hostel> hostels = adminService.getAllHostels();
                response.setStatus(HttpServletResponse.SC_OK);
                out.print(JSONHelper.toJSON(hostels));
                out.flush();
                return;
            }

            if (path.startsWith("/hostels/")) {
                String hostelIdStr = path.substring("/hostels/".length());
                try {
                    int hostelId = Integer.parseInt(hostelIdStr);
                    Hostel hostel = adminService.getHostelById(hostelId);
                    if (hostel != null) {
                        response.setStatus(HttpServletResponse.SC_OK);
                        out.print(JSONHelper.toJSON(hostel));
                    } else {
                        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                        Map<String, Object> error = new HashMap<>();
                        error.put("message", "Không tìm thấy nhà trọ");
                        out.print(JSONHelper.toJSON(error));
                    }
                } catch (NumberFormatException e) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "ID nhà trọ không hợp lệ");
                    out.print(JSONHelper.toJSON(error));
                }
                out.flush();
                return;
            }

            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Endpoint không tồn tại");
            out.print(JSONHelper.toJSON(error));
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
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        
        PrintWriter out = response.getWriter();
        String path = request.getPathInfo();

        try {
            if (!checkAdminAuth(request, response)) {
                return;
            }

            JsonObject jsonRequest = JSONHelper.parseJSONRequest(request);

            if (path != null && path.startsWith("/users/") && path.endsWith("/password")) {
                // Update user password
                String userIdStr = path.substring("/users/".length(), path.length() - "/password".length());
                try {
                    int userId = Integer.parseInt(userIdStr);
                    String newPassword = jsonRequest.get("password").getAsString();
                    
                    if (newPassword == null || newPassword.trim().isEmpty()) {
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        Map<String, Object> error = new HashMap<>();
                        error.put("message", "Mật khẩu không được để trống");
                        out.print(JSONHelper.toJSON(error));
                        out.flush();
                        return;
                    }

                    boolean success = adminService.updateUserPassword(userId, newPassword);
                    if (success) {
                        response.setStatus(HttpServletResponse.SC_OK);
                        Map<String, Object> successResponse = new HashMap<>();
                        successResponse.put("message", "Cập nhật mật khẩu thành công");
                        out.print(JSONHelper.toJSON(successResponse));
                    } else {
                        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        Map<String, Object> error = new HashMap<>();
                        error.put("message", "Không thể cập nhật mật khẩu");
                        out.print(JSONHelper.toJSON(error));
                    }
                } catch (NumberFormatException e) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "ID người dùng không hợp lệ");
                    out.print(JSONHelper.toJSON(error));
                }
                out.flush();
                return;
            }

            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Endpoint không hợp lệ");
            out.print(JSONHelper.toJSON(error));
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
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        PrintWriter out = response.getWriter();
        String path = request.getPathInfo();

        try {
            if (!checkAdminAuth(request, response)) {
                return;
            }

            if (path != null && path.startsWith("/users/")) {
                String userIdStr = path.substring("/users/".length());
                
                // Handle activate/deactivate endpoints first (these don't need request body)
                if (path.endsWith("/activate")) {
                    userIdStr = userIdStr.substring(0, userIdStr.length() - "/activate".length());
                    try {
                        int userId = Integer.parseInt(userIdStr);
                        boolean success = adminService.activateUser(userId);
                        if (success) {
                            response.setStatus(HttpServletResponse.SC_OK);
                            Map<String, Object> successResponse = new HashMap<>();
                            successResponse.put("message", "Kích hoạt tài khoản thành công");
                            out.print(JSONHelper.toJSON(successResponse));
                        } else {
                            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                            Map<String, Object> error = new HashMap<>();
                            error.put("message", "Không thể kích hoạt tài khoản");
                            out.print(JSONHelper.toJSON(error));
                        }
                        out.flush();
                        return;
                    } catch (NumberFormatException e) {
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        Map<String, Object> error = new HashMap<>();
                        error.put("message", "ID người dùng không hợp lệ");
                        out.print(JSONHelper.toJSON(error));
                        out.flush();
                        return;
                    }
                }

                if (path.endsWith("/deactivate")) {
                    userIdStr = userIdStr.substring(0, userIdStr.length() - "/deactivate".length());
                    try {
                        int userId = Integer.parseInt(userIdStr);
                        boolean success = adminService.deactivateUser(userId);
                        if (success) {
                            response.setStatus(HttpServletResponse.SC_OK);
                            Map<String, Object> successResponse = new HashMap<>();
                            successResponse.put("message", "Vô hiệu hóa tài khoản thành công");
                            out.print(JSONHelper.toJSON(successResponse));
                        } else {
                            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                            Map<String, Object> error = new HashMap<>();
                            error.put("message", "Không thể vô hiệu hóa tài khoản");
                            out.print(JSONHelper.toJSON(error));
                        }
                        out.flush();
                        return;
                    } catch (NumberFormatException e) {
                        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                        Map<String, Object> error = new HashMap<>();
                        error.put("message", "ID người dùng không hợp lệ");
                        out.print(JSONHelper.toJSON(error));
                        out.flush();
                        return;
                    }
                }
                
                // Handle regular user update (needs request body)
                try {
                    JsonObject jsonRequest = JSONHelper.parseJSONRequest(request);
                    int userId = Integer.parseInt(userIdStr);

                    // Update user info
                    User user = adminService.getUserById(userId);
                    if (user == null) {
                        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                        Map<String, Object> error = new HashMap<>();
                        error.put("message", "Không tìm thấy người dùng");
                        out.print(JSONHelper.toJSON(error));
                        out.flush();
                        return;
                    }

                    if (jsonRequest.has("fullName")) {
                        user.setFullName(jsonRequest.get("fullName").getAsString());
                    }
                    if (jsonRequest.has("email")) {
                        user.setEmail(jsonRequest.get("email").getAsString());
                    }
                    if (jsonRequest.has("phoneNumber")) {
                        user.setPhoneNumber(jsonRequest.get("phoneNumber").getAsString());
                    }
                    if (jsonRequest.has("role")) {
                        user.setRole(jsonRequest.get("role").getAsString());
                    }
                    if (jsonRequest.has("balance")) {
                        user.setBalance(jsonRequest.get("balance").getAsDouble());
                    }
                    if (jsonRequest.has("isActive")) {
                        user.setIsActive(jsonRequest.get("isActive").getAsBoolean());
                    }

                    boolean success = adminService.updateUser(user);
                    if (success) {
                        response.setStatus(HttpServletResponse.SC_OK);
                        Map<String, Object> successResponse = new HashMap<>();
                        successResponse.put("message", "Cập nhật thông tin thành công");
                        out.print(JSONHelper.toJSON(successResponse));
                    } else {
                        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        Map<String, Object> error = new HashMap<>();
                        error.put("message", "Không thể cập nhật thông tin");
                        out.print(JSONHelper.toJSON(error));
                    }
                    out.flush();
                    return;

                } catch (NumberFormatException e) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "ID người dùng không hợp lệ");
                    out.print(JSONHelper.toJSON(error));
                    out.flush();
                    return;
                }
            }

            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Endpoint không hợp lệ");
            out.print(JSONHelper.toJSON(error));
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
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        PrintWriter out = response.getWriter();
        String path = request.getPathInfo();

        try {
            if (!checkAdminAuth(request, response)) {
                return;
            }

            if (path != null && path.startsWith("/reviews/")) {
                String reviewIdStr = path.substring("/reviews/".length());
                try {
                    int reviewId = Integer.parseInt(reviewIdStr);
                    boolean success = adminService.deleteReview(reviewId);
                    if (success) {
                        response.setStatus(HttpServletResponse.SC_OK);
                        Map<String, Object> successResponse = new HashMap<>();
                        successResponse.put("message", "Xóa đánh giá thành công");
                        out.print(JSONHelper.toJSON(successResponse));
                    } else {
                        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        Map<String, Object> error = new HashMap<>();
                        error.put("message", "Không thể xóa đánh giá");
                        out.print(JSONHelper.toJSON(error));
                    }
                } catch (NumberFormatException e) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "ID đánh giá không hợp lệ");
                    out.print(JSONHelper.toJSON(error));
                }
                out.flush();
                return;
            }

            if (path != null && path.startsWith("/hostels/")) {
                String hostelIdStr = path.substring("/hostels/".length());
                try {
                    int hostelId = Integer.parseInt(hostelIdStr);
                    boolean success = adminService.deleteHostel(hostelId);
                    if (success) {
                        response.setStatus(HttpServletResponse.SC_OK);
                        Map<String, Object> successResponse = new HashMap<>();
                        successResponse.put("message", "Xóa nhà trọ thành công");
                        out.print(JSONHelper.toJSON(successResponse));
                    } else {
                        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                        Map<String, Object> error = new HashMap<>();
                        error.put("message", "Không thể xóa nhà trọ");
                        out.print(JSONHelper.toJSON(error));
                    }
                } catch (NumberFormatException e) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "ID nhà trọ không hợp lệ");
                    out.print(JSONHelper.toJSON(error));
                }
                out.flush();
                return;
            }

            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Endpoint không hợp lệ");
            out.print(JSONHelper.toJSON(error));
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
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setStatus(HttpServletResponse.SC_OK);
    }

    private boolean checkAdminAuth(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            PrintWriter out = response.getWriter();
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Chưa đăng nhập");
            out.print(JSONHelper.toJSON(error));
            out.flush();
            return false;
        }

        String token = authHeader.substring("Bearer ".length());
        if (!authService.validateToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            PrintWriter out = response.getWriter();
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Token không hợp lệ");
            out.print(JSONHelper.toJSON(error));
            out.flush();
            return false;
        }

        String userId = authService.getUserIdFromToken(token);
        if (!adminService.isAdmin(userId)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            PrintWriter out = response.getWriter();
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Không có quyền truy cập");
            out.print(JSONHelper.toJSON(error));
            out.flush();
            return false;
        }

        return true;
    }
}

