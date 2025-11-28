package controller;

import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.Room;
import service.RoomService;
import util.JSONHelper;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/rooms")
public class RoomServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private RoomService roomService;

    @Override
    public void init() throws ServletException {
        super.init();
        roomService = new RoomService();
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
            String hostelIdParam = request.getParameter("hostelId");
            String statusParam = request.getParameter("status");

            Object result;

            if (idParam != null) {
                int id = Integer.parseInt(idParam);
                Room room = roomService.findById(id);
                if (room == null) {
                    response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "Không tìm thấy phòng");
                    out.print(JSONHelper.toJSON(error));
                    out.flush();
                    return;
                }
                result = room;
            } else if (hostelIdParam != null) {
                int hostelId = Integer.parseInt(hostelIdParam);
                List<Room> rooms = roomService.findByHostelId(hostelId);
                result = rooms;
            } else if (statusParam != null) {
                List<Room> rooms = roomService.findByStatus(statusParam);
                result = rooms;
            } else {
                List<Room> rooms = roomService.findAll();
                result = rooms;
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

            Room room = new Room();
            room.setHostelId(json.get("hostelId").getAsInt());
            room.setRoomNumber(json.get("roomNumber").getAsString());
            room.setFloor(json.has("floor") ? json.get("floor").getAsInt() : 1);
            room.setAreaM2(json.has("areaM2") ? json.get("areaM2").getAsDouble() : 0);
            room.setPricePerMonth(json.get("pricePerMonth").getAsDouble());
            room.setDepositAmount(json.has("depositAmount") ? json.get("depositAmount").getAsDouble() : 0);
            room.setMaxOccupants(json.has("maxOccupants") ? json.get("maxOccupants").getAsInt() : 1);
            room.setElectricityPricePerKwh(json.has("electricityPricePerKwh")
                    ? json.get("electricityPricePerKwh").getAsDouble() : 0);
            room.setWaterPricePerM3(json.has("waterPricePerM3")
                    ? json.get("waterPricePerM3").getAsDouble() : 0);
            room.setWifiFee(json.has("wifiFee") ? json.get("wifiFee").getAsDouble() : 0);
            room.setParkingFee(json.has("parkingFee") ? json.get("parkingFee").getAsDouble() : 0);
            room.setRoomStatus(json.has("roomStatus") ? json.get("roomStatus").getAsString() : "AVAILABLE");
            room.setHasAirConditioner(json.has("hasAirConditioner") && json.get("hasAirConditioner").getAsBoolean());
            room.setHasWaterHeater(json.has("hasWaterHeater") && json.get("hasWaterHeater").getAsBoolean());
            room.setHasPrivateBathroom(json.has("hasPrivateBathroom") && json.get("hasPrivateBathroom").getAsBoolean());
            room.setHasKitchen(json.has("hasKitchen") && json.get("hasKitchen").getAsBoolean());
            room.setAllowPet(json.has("allowPet") && json.get("allowPet").getAsBoolean());
            room.setDescription(json.has("description") ? json.get("description").getAsString() : null);

            Room created = roomService.create(room);
            if (created == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Không tạo được phòng");
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
            int roomId = json.get("roomId").getAsInt();
            String status = json.get("status").getAsString();

            boolean ok = roomService.updateStatus(roomId, status);

            Map<String, Object> result = new HashMap<>();
            result.put("success", ok);

            if (!ok) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                result.put("message", "Không update được trạng thái phòng");
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
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        response.setStatus(HttpServletResponse.SC_OK);
    }
}
