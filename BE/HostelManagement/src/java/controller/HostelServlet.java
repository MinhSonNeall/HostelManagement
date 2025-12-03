package controller;

import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Hostel;
import service.HostelService;
import util.JSONHelper;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/hostels/*")
public class HostelServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private HostelService hostelService;

    @Override
    public void init() throws ServletException {
        super.init();
        hostelService = new HostelService();
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
            String ownerIdParam = request.getParameter("ownerId");

            Object result;

            if (idParam != null) {
                int id = Integer.parseInt(idParam);
                Hostel hostel = hostelService.findById(id);
                if (hostel == null) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "Không tìm thấy nhà trọ");
                    out.print(JSONHelper.toJSON(error));
                    out.flush();
                    return;
                }
                result = hostel;
            } else if (ownerIdParam != null) {
                int ownerId = Integer.parseInt(ownerIdParam);
                List<Hostel> hostels = hostelService.findByOwnerId(ownerId);
                result = hostels;
            } else {
                List<Hostel> hostels = hostelService.findAll();
                result = hostels;
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

            Hostel hostel = new Hostel();
            hostel.setOwnerId(json.get("ownerId").getAsInt());
            hostel.setHostelName(json.get("hostelName").getAsString());
            hostel.setAddress(json.get("address").getAsString());
            hostel.setWard(json.has("ward") ? json.get("ward").getAsString() : null);
            hostel.setDistrict(json.has("district") ? json.get("district").getAsString() : null);
            hostel.setCity(json.has("city") ? json.get("city").getAsString() : null);
            hostel.setDescription(json.has("description") ? json.get("description").getAsString() : null);
            hostel.setBackgroundImg(json.has("backgroundImg") && !json.get("backgroundImg").isJsonNull()
                    ? json.get("backgroundImg").getAsString()
                    : null);
            hostel.setTotalFloors(json.has("totalFloors") ? json.get("totalFloors").getAsInt() : 1);
            hostel.setTotalRooms(json.has("totalRooms") ? json.get("totalRooms").getAsInt() : 0);

            Hostel created = hostelService.create(hostel);
            if (created == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Không tạo được nhà trọ");
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
            String pathInfo = request.getPathInfo();
            if (pathInfo == null || pathInfo.length() <= 1) {
                sendBadRequest(response, out, "Thiếu id dãy trọ");
                return;
            }

            int hostelId = Integer.parseInt(pathInfo.substring(1));
            Hostel existing = hostelService.findById(hostelId);
            if (existing == null) {
                sendNotFound(response, out, "Không tìm thấy dãy trọ");
                return;
            }

            JsonObject json = JSONHelper.parseJSONRequest(request);
            Hostel updated = buildHostelFromJson(json, existing);
            updated.setHostelId(hostelId);

            boolean success = hostelService.update(updated);
            if (!success) {
                sendBadRequest(response, out, "Không thể cập nhật dãy trọ");
                return;
            }

            response.setStatus(HttpServletResponse.SC_OK);
            out.print(JSONHelper.toJSON(updated));
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
    protected void doDelete(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        PrintWriter out = response.getWriter();

        try {
            String pathInfo = request.getPathInfo();
            if (pathInfo == null || pathInfo.length() <= 1) {
                sendBadRequest(response, out, "Thiếu id dãy trọ");
                return;
            }

            int hostelId = Integer.parseInt(pathInfo.substring(1));
            boolean ok = hostelService.delete(hostelId);
            if (!ok) {
                sendBadRequest(response, out, "Không thể xóa dãy trọ");
                return;
            }

            response.setStatus(HttpServletResponse.SC_NO_CONTENT);

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
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setStatus(HttpServletResponse.SC_OK);
    }

    private Hostel buildHostelFromJson(JsonObject json, Hostel base) {
        Hostel hostel = base != null ? base : new Hostel();
        if (json.has("ownerId")) {
            hostel.setOwnerId(json.get("ownerId").getAsInt());
        }
        if (json.has("hostelName")) {
            hostel.setHostelName(json.get("hostelName").getAsString());
        }
        if (json.has("address")) {
            hostel.setAddress(json.get("address").getAsString());
        }
        if (json.has("ward")) {
            hostel.setWard(json.get("ward").isJsonNull() ? null : json.get("ward").getAsString());
        }
        if (json.has("district")) {
            hostel.setDistrict(json.get("district").isJsonNull() ? null : json.get("district").getAsString());
        }
        if (json.has("city")) {
            hostel.setCity(json.get("city").isJsonNull() ? null : json.get("city").getAsString());
        }
        if (json.has("description")) {
            hostel.setDescription(json.get("description").isJsonNull() ? null : json.get("description").getAsString());
        }
        if (json.has("backgroundImg")) {
            hostel.setBackgroundImg(json.get("backgroundImg").isJsonNull() ? null : json.get("backgroundImg").getAsString());
        }
        if (json.has("totalFloors")) {
            hostel.setTotalFloors(json.get("totalFloors").getAsInt());
        }
        if (json.has("totalRooms")) {
            hostel.setTotalRooms(json.get("totalRooms").getAsInt());
        }
        return hostel;
    }

    private void sendBadRequest(HttpServletResponse response, PrintWriter out, String message) {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        Map<String, Object> error = new HashMap<>();
        error.put("message", message);
        out.print(JSONHelper.toJSON(error));
        out.flush();
    }

    private void sendNotFound(HttpServletResponse response, PrintWriter out, String message) {
        response.setStatus(HttpServletResponse.SC_NOT_FOUND);
        Map<String, Object> error = new HashMap<>();
        error.put("message", message);
        out.print(JSONHelper.toJSON(error));
        out.flush();
    }
}
