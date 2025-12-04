package filter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.FilterConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Simple global CORS filter để frontend (Vite, v.v.) có thể gọi tất cả API,
 * bao gồm cả các request có Authorization header như /api/admin/users.
 */
@WebFilter("/*")
public class CorsFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {}

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        // Cho phép origin hiện tại (phải chỉ định cụ thể, không dùng "*" khi có credentials)
        String origin = req.getHeader("Origin");
        // Nếu không có origin header, lấy từ Referer hoặc mặc định
        if (origin == null || origin.isEmpty()) {
            String referer = req.getHeader("Referer");
            if (referer != null && !referer.isEmpty()) {
                // Lấy origin từ Referer (ví dụ: http://localhost:5173/login -> http://localhost:5173)
                try {
                    java.net.URL url = new java.net.URL(referer);
                    origin = url.getProtocol() + "://" + url.getHost() + (url.getPort() != -1 ? ":" + url.getPort() : "");
                } catch (Exception e) {
                    // Nếu không parse được, dùng mặc định
                    origin = "http://localhost:5173";
                }
            } else {
                // Mặc định cho phép localhost:5173 (Vite dev server)
                origin = "http://localhost:5173";
            }
        }
        
        // Luôn set origin cụ thể, không bao giờ dùng "*" khi có credentials
        // Đây là bắt buộc khi dùng withCredentials: true
        
        // Trả lời luôn cho preflight
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
            res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With");
            res.setHeader("Access-Control-Max-Age", "3600");
            res.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // Set CORS headers trước khi xử lý request
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
        res.setHeader("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With");
        res.setHeader("Access-Control-Expose-Headers", "Content-Length, Content-Type");
        res.setHeader("Access-Control-Max-Age", "3600");
        
        // Cho phép load images từ external sources
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");

        chain.doFilter(request, response);
        
        // Đảm bảo CORS headers vẫn còn sau khi xử lý (nếu bị override)
        if (!res.containsHeader("Access-Control-Allow-Origin")) {
            res.setHeader("Access-Control-Allow-Origin", origin);
            res.setHeader("Access-Control-Allow-Credentials", "true");
        }
    }

    @Override
    public void destroy() {}
}
