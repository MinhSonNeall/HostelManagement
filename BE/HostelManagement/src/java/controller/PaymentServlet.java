package controller;

import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Payment;
import service.PaymentService;
import util.JSONHelper;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/payments")
public class PaymentServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private PaymentService paymentService;

    @Override
    public void init() throws ServletException {
        super.init();
        paymentService = new PaymentService();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");

        PrintWriter out = response.getWriter();

        try {
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
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "PUT, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setStatus(HttpServletResponse.SC_OK);
    }
}
