package controller;

import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Payment;
import service.PaymentService;
import service.VietQRService;
import service.BookingService;
import util.JSONHelper;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/payments/*")
public class PaymentServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private PaymentService paymentService;
    private VietQRService vietQRService;
    private BookingService bookingService;

    @Override
    public void init() throws ServletException {
        super.init();
        paymentService = new PaymentService();
        vietQRService = new VietQRService();
        bookingService = new BookingService();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        // CORS headers được xử lý bởi CorsFilter

        PrintWriter out = response.getWriter();

        try {
            String pathInfo = request.getPathInfo();
            
            // Endpoint: /api/payments/qr?bookingId=xxx&amount=xxx
            if (pathInfo != null && pathInfo.equals("/qr")) {
                String bookingIdParam = request.getParameter("bookingId");
                String amountParam = request.getParameter("amount");
                
                if (bookingIdParam == null || amountParam == null) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "Thiếu tham số bookingId hoặc amount");
                    out.print(JSONHelper.toJSON(error));
                    out.flush();
                    return;
                }
                
                int bookingId = Integer.parseInt(bookingIdParam);
                double amount = Double.parseDouble(amountParam);
                int randomCode = vietQRService.generateRandomCode();
                
                String qrUrl = vietQRService.generateQRCode(amount, bookingId, randomCode);
                
                if (qrUrl == null) {
                    response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "Không thể tạo QR code");
                    out.print(JSONHelper.toJSON(error));
                    out.flush();
                    return;
                }
                
                Map<String, Object> result = new HashMap<>();
                result.put("qrUrl", qrUrl);
                result.put("bookingId", bookingId);
                result.put("amount", amount);
                result.put("code", randomCode);
                
                response.setStatus(HttpServletResponse.SC_OK);
                out.print(JSONHelper.toJSON(result));
                out.flush();
                return;
            }
            
            // Endpoint: /api/payments/check?bookingId=xxx&code=xxx&amount=xxx
            if (pathInfo != null && pathInfo.equals("/check")) {
                String bookingIdParam = request.getParameter("bookingId");
                String codeParam = request.getParameter("code");
                String amountParam = request.getParameter("amount");
                
                if (bookingIdParam == null || codeParam == null || amountParam == null) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "Thiếu tham số bookingId, code hoặc amount");
                    out.print(JSONHelper.toJSON(error));
                    out.flush();
                    return;
                }
                
                int bookingId = Integer.parseInt(bookingIdParam);
                int code = Integer.parseInt(codeParam);
                int amount = Integer.parseInt(amountParam);
                
                boolean isPaid = vietQRService.checkPaymentByBooking(bookingId, code, amount);
                
                Map<String, Object> result = new HashMap<>();
                result.put("paid", isPaid);
                result.put("bookingId", bookingId);
                
                if (isPaid) {
                    // Cập nhật trạng thái booking và tạo payment record
                    bookingService.updateStatus(bookingId, "CONFIRMED");
                    
                    // Tạo payment record
                    Payment payment = new Payment();
                    payment.setBookingId(bookingId);
                    payment.setAmount(amount);
                    payment.setPaymentMethod("VIETQR");
                    payment.setNote("Thanh toán qua VietQR - Code: " + code);
                    payment.setStatus("SUCCESS");
                    paymentService.create(payment);
                    
                    result.put("message", "Thanh toán thành công!");
                } else {
                    result.put("message", "Chưa nhận được thanh toán");
                }
                
                response.setStatus(HttpServletResponse.SC_OK);
                out.print(JSONHelper.toJSON(result));
                out.flush();
                return;
            }
            
            // Các endpoint GET thông thường
            String idParam = request.getParameter("id");
            String bookingIdParam = request.getParameter("bookingId");

            Object result;

            if (idParam != null) {
                int id = Integer.parseInt(idParam);
                Payment payment = paymentService.findById(id);
                if (payment == null) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "Không tìm thấy payment");
                    out.print(JSONHelper.toJSON(error));
                    out.flush();
                    return;
                }
                result = payment;
            } else if (bookingIdParam != null) {
                int bookingId = Integer.parseInt(bookingIdParam);
                List<Payment> list = paymentService.findByBookingId(bookingId);
                result = list;
            } else {
                result = paymentService.findAll();
            }

            response.setStatus(HttpServletResponse.SC_OK);
            out.print(JSONHelper.toJSON(result));
            out.flush();

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Lỗi server: " + e.getMessage());
            out.print(JSONHelper.toJSON(error));
            out.flush();
            e.printStackTrace();
        }
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

            Payment payment = new Payment();
            payment.setBookingId(json.get("bookingId").getAsInt());
            payment.setAmount(json.get("amount").getAsDouble());
            payment.setPaymentMethod(json.get("paymentMethod").getAsString());
            payment.setNote(json.has("note") ? json.get("note").getAsString() : null);
            payment.setStatus(json.has("status") ? json.get("status").getAsString() : "SUCCESS");

            Payment created = paymentService.create(payment);
            if (created == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Không tạo được payment");
                out.print(JSONHelper.toJSON(error));
                out.flush();
                return;
            }

            response.setStatus(HttpServletResponse.SC_CREATED);
            out.print(JSONHelper.toJSON(created));
            out.flush();

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Lỗi server: " + e.getMessage());
            out.print(JSONHelper.toJSON(error));
            out.flush();
            e.printStackTrace();
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        // CORS headers được xử lý bởi CorsFilter

        PrintWriter out = response.getWriter();

        try {
            JsonObject json = JSONHelper.parseJSONRequest(request);
            int paymentId = json.get("paymentId").getAsInt();
            String status = json.get("status").getAsString();

            boolean ok = paymentService.updateStatus(paymentId, status);

            Map<String, Object> result = new HashMap<>();
            result.put("success", ok);

            if (!ok) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                result.put("message", "Không update được trạng thái payment");
            } else {
                response.setStatus(HttpServletResponse.SC_OK);
            }

            out.print(JSONHelper.toJSON(result));
            out.flush();

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Lỗi server: " + e.getMessage());
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
