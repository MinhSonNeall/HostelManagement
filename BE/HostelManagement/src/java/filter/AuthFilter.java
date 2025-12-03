package filter;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import service.AuthService;

import java.io.IOException;

@WebFilter("/api/*")  
public class AuthFilter implements Filter {

    private AuthService authService;

    @Override
    public void init(FilterConfig filterConfig) {
        authService = new AuthService();
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        // Cho phép các preflight request (OPTIONS) đi qua để CorsFilter xử lý CORS
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            chain.doFilter(request, response);
            return;
        }
        
        //Allow login requests to pass without a token
        String path = req.getRequestURI();
        if (path.endsWith("/api/auth/login")|| path.endsWith("/api/auth/register")){
            chain.doFilter(request, response);
            return;
        }

        String authHeader = req.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Đảm bảo luôn có header CORS kể cả khi trả về 401
            addCorsHeaders(req, res);
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String token = authHeader.substring("Bearer ".length());

        if (!authService.validateToken(token)) {
            // Đảm bảo luôn có header CORS kể cả khi trả về 401
            addCorsHeaders(req, res);
            res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }
        
        //Can set userId in request attribute if needed
        String userId = authService.getUserIdFromToken(token);
        req.setAttribute("userId", userId);

        chain.doFilter(request, response);
    }

    /**
     * Thêm các header CORS cơ bản cho response dùng khi filter trả về lỗi
     * mà không đi qua CorsFilter.
     */
    private void addCorsHeaders(HttpServletRequest req, HttpServletResponse res) {
        String origin = req.getHeader("Origin");
        if (origin != null && !origin.isEmpty()) {
            res.setHeader("Access-Control-Allow-Origin", origin);
        } else {
            res.setHeader("Access-Control-Allow-Origin", "*");
        }
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization");
        res.setHeader("Access-Control-Max-Age", "3600");
    }

    @Override
    public void destroy() { }
}
