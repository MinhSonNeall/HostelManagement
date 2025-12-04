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
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        // CORS headers được xử lý bởi CorsFilter
        
        PrintWriter out = response.getWriter();

        try {
            JsonObject jsonRequest = JSONHelper.parseJSONRequest(request);
            
            String email = null;
            if (jsonRequest.has("email") && !jsonRequest.get("email").isJsonNull()) {
                email = jsonRequest.get("email").getAsString();
            } else if (jsonRequest.has("username") && !jsonRequest.get("username").isJsonNull()) {
                email = jsonRequest.get("username").getAsString(); // backward compatibility
            }

            String password = jsonRequest.has("password") && !jsonRequest.get("password").isJsonNull()
                    ? jsonRequest.get("password").getAsString()
                    : null;

            // Validate input
            if (email == null || email.trim().isEmpty() || 
                password == null || password.trim().isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Email và mật khẩu không được để trống");
                out.print(JSONHelper.toJSON(errorResponse));
                out.flush();
                return;
            }

            User user = authService.authenticate(email, password);
            
            if (user == null) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("message", "Email hoặc mật khẩu không đúng");
                out.print(JSONHelper.toJSON(errorResponse));
                out.flush();
                return;
            }

            String token = authService.generateToken(user);

            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("username", user.getEmail());
            userMap.put("email", user.getEmail());
            userMap.put("role", user.getRole());
            userMap.put("fullName", user.getFullName());
            userMap.put("balance", user.getBalance());

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
        // CORS headers được xử lý bởi CorsFilter
        response.setStatus(HttpServletResponse.SC_OK);
    }

}

