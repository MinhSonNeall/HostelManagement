package controller;

import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.User;
import service.AuthService;
import util.JSONHelper;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

/**
 * Login Servlet Controller
 * Endpoint: /api/auth/login
 * Method: POST
 * Request Body: { "username": "string", "password": "string" }
 * Response: { "token": "string", "user": { "id": "string", "username": "string", ... } }
 */
@WebServlet("/api/auth/login")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
    private AuthService authService;

    @Override
    public void init() throws ServletException {
        super.init();
        authService = new AuthService();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        
        // Set response content type to JSON
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        // Enable CORS (if needed for frontend)
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
        PrintWriter out = response.getWriter();

        try {
            // Parse JSON request body
            JsonObject jsonRequest = JSONHelper.parseJSONRequest(request);
            
            String username = jsonRequest.get("username").getAsString();
            String password = jsonRequest.get("password").getAsString();

            // Validate input
            if (username == null || username.trim().isEmpty() || 
                password == null || password.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Tên đăng nhập và mật khẩu không được để trống");
                out.print(JSONHelper.toJSON(errorResponse));
                out.flush();
                return;
            }

            // Authenticate user using AuthService
            User user = authService.authenticate(username, password);
            
            if (user == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Tên đăng nhập hoặc mật khẩu không đúng");
                out.print(JSONHelper.toJSON(errorResponse));
                out.flush();
                return;
            }

            // Generate token
            String token = authService.generateToken(user);

            // Create user object for response (without password)
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("username", user.getUsername());
            userMap.put("email", user.getEmail());
            userMap.put("role", user.getRole());
            userMap.put("fullName", user.getFullName());
            userMap.put("balance", user.getBalance());

            // Create login response matching frontend format: { token, user }
            Map<String, Object> loginResponse = new HashMap<>();
            loginResponse.put("token", token);
            loginResponse.put("user", userMap);

            response.setStatus(HttpServletResponse.SC_OK);
            out.print(JSONHelper.toJSON(loginResponse));
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
        // Handle CORS preflight
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_OK);
    }

}

