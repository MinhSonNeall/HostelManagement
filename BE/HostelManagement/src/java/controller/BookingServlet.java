package controller;

import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Booking;
import service.BookingService;
import util.JSONHelper;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/bookings")
public class BookingServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private BookingService bookingService;

    @Override
    public void init() throws ServletException {
        super.init();
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
            String idParam = request.getParameter("id");
            String customerIdParam = request.getParameter("customerId");
            String roomIdParam = request.getParameter("roomId");
            String statusParam = request.getParameter("status");

            Object result;

            if (idParam != null) {
                int id = Integer.parseInt(idParam);
                Booking booking = bookingService.findById(id);
                if (booking == null) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "Không tìm thấy booking");
                    out.print(JSONHelper.toJSON(error));
                    out.flush();
                    return;
                }
                result = booking;
            } else if (customerIdParam != null) {
                int customerId = Integer.parseInt(customerIdParam);
                result = bookingService.findByCustomerId(customerId);
            } else if (roomIdParam != null) {
                int roomId = Integer.parseInt(roomIdParam);
                result = bookingService.findByRoomId(roomId);
            } else if (statusParam != null) {
                result = bookingService.findByStatus(statusParam);
            } else {
                result = bookingService.findAll();
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
            System.out.println("BookingServlet: Received booking request: " + json.toString());

            Booking booking = new Booking();
            booking.setRoomId(json.get("roomId").getAsInt());
            booking.setCustomerId(json.get("customerId").getAsInt());

            // date format: "yyyy-MM-dd"
            String startDateStr = json.get("startDate").getAsString();
            System.out.println("BookingServlet: Start date: " + startDateStr);
            booking.setStartDate(Date.valueOf(startDateStr));
            
            if (json.has("endDate") && !json.get("endDate").isJsonNull()) {
                String endDateStr = json.get("endDate").getAsString();
                booking.setEndDate(Date.valueOf(endDateStr));
            }

            booking.setBookingStatus(json.has("bookingStatus")
                    ? json.get("bookingStatus").getAsString()
                    : "PENDING");

            if (json.has("totalPrice")) {
                booking.setTotalPrice(json.get("totalPrice").getAsDouble());
            } else {
                booking.setTotalPrice(0);
            }

            System.out.println("BookingServlet: Creating booking...");
            Booking created = bookingService.create(booking);
            
            if (created == null) {
                System.err.println("BookingServlet: Failed to create booking");
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Không tạo được booking");
                out.print(JSONHelper.toJSON(error));
                out.flush();
                return;
            }

            System.out.println("BookingServlet: Booking created successfully with ID: " + created.getBookingId());
            response.setStatus(HttpServletResponse.SC_CREATED);
            String jsonResponse = JSONHelper.toJSON(created);
            System.out.println("BookingServlet: Sending response: " + jsonResponse);
            out.print(jsonResponse);
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
            int bookingId = json.get("bookingId").getAsInt();
            String status = json.get("status").getAsString();

            boolean ok = bookingService.updateStatus(bookingId, status);

            Map<String, Object> result = new HashMap<>();
            result.put("success", ok);

            if (!ok) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                result.put("message", "Không update được trạng thái booking");
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
