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

@WebServlet("/api/hostels")
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
    protected void doOptions(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setStatus(HttpServletResponse.SC_OK);
    }
}
