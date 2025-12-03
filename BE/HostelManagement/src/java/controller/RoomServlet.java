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

@WebServlet("/api/rooms/*")
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
            String includePicturesParam = request.getParameter("includePictures");
            boolean includePictures = "true".equalsIgnoreCase(includePicturesParam);

            String pathInfo = request.getPathInfo();
            if (pathInfo != null && pathInfo.length() > 1) {
                int roomId = Integer.parseInt(pathInfo.substring(1));
                Room room = roomService.findById(roomId);
                if (room == null) {
                    sendNotFound(response, out, "Không tìm thấy phòng");
                    return;
                }
                if (includePictures) {
                    roomService.attachPictures(room);
                }
                response.setStatus(HttpServletResponse.SC_OK);
                out.print(JSONHelper.toJSON(room));
                out.flush();
                return;
            }

            String idParam = request.getParameter("id");
            String hostelIdParam = request.getParameter("hostelId");
            String statusParam = request.getParameter("status");

            Object result;

            if (idParam != null) {
                int id = Integer.parseInt(idParam);
                Room room = roomService.findById(id);
                if (room == null) {
                    sendNotFound(response, out, "Không tìm thấy phòng");
                    return;
                }
                if (includePictures) {
                    roomService.attachPictures(room);
                }
                result = room;
            } else if (hostelIdParam != null) {
                int hostelId = Integer.parseInt(hostelIdParam);
                List<Room> rooms = roomService.findByHostelId(hostelId);
                if (includePictures) {
                    rooms.forEach(roomService::attachPictures);
                }
                result = rooms;
            } else if (statusParam != null) {
                List<Room> rooms = roomService.findByStatus(statusParam);
                if (includePictures) {
                    rooms.forEach(roomService::attachPictures);
                }
                result = rooms;
            } else {
                List<Room> rooms = roomService.findAll();
                if (includePictures) {
                    rooms.forEach(roomService::attachPictures);
                }
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

            Room room = buildRoomFromJson(json, null);
            if (room.getHostelId() == 0 || room.getRoomNumber() == null || room.getRoomNumber().isBlank()) {
                sendBadRequest(response, out, "Thiếu thông tin hostelId hoặc roomNumber");
                return;
            }
            if (room.getPricePerMonth() <= 0) {
                sendBadRequest(response, out, "pricePerMonth phải lớn hơn 0");
                return;
            }
            Room created = roomService.create(room);
            if (created == null) {
                sendBadRequest(response, out, "Không tạo được phòng");
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

            if (pathInfo != null && pathInfo.length() > 1) {
                int roomId = Integer.parseInt(pathInfo.substring(1));
                Room existing = roomService.findById(roomId);
                if (existing == null) {
                    sendNotFound(response, out, "Không tìm thấy phòng");
                    return;
                }
                JsonObject json = JSONHelper.parseJSONRequest(request);
                Room updatedRoom = buildRoomFromJson(json, existing);
                updatedRoom.setRoomId(roomId);

                boolean ok = roomService.update(updatedRoom);
                if (!ok) {
                    sendBadRequest(response, out, "Không thể cập nhật phòng");
                    return;
                }
                response.setStatus(HttpServletResponse.SC_OK);
                out.print(JSONHelper.toJSON(updatedRoom));
                out.flush();
                return;
            }

            JsonObject json = JSONHelper.parseJSONRequest(request);
            if (!json.has("roomId") || !json.has("status")) {
                sendBadRequest(response, out, "Thiếu roomId hoặc status");
                return;
            }
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
            String idParam = null;
            if (pathInfo != null && pathInfo.length() > 1) {
                idParam = pathInfo.substring(1);
            } else {
                idParam = request.getParameter("id");
            }

            if (idParam == null) {
                sendBadRequest(response, out, "Thiếu id phòng");
                return;
            }

            int roomId = Integer.parseInt(idParam);
            boolean ok = roomService.delete(roomId);
            if (!ok) {
                sendBadRequest(response, out, "Không thể xóa phòng");
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

    private Room buildRoomFromJson(JsonObject json, Room base) {
        Room room = base != null ? base : new Room();

        if (json.has("hostelId")) {
            room.setHostelId(json.get("hostelId").getAsInt());
        }
        if (json.has("roomNumber")) {
            room.setRoomNumber(json.get("roomNumber").getAsString());
        }
        if (json.has("floor")) {
            room.setFloor(json.get("floor").getAsInt());
        }
        if (json.has("areaM2")) {
            room.setAreaM2(json.get("areaM2").getAsDouble());
        } else if (json.has("area")) {
            room.setAreaM2(json.get("area").getAsDouble());
        }
        if (json.has("pricePerMonth")) {
            room.setPricePerMonth(json.get("pricePerMonth").getAsDouble());
        } else if (json.has("price")) {
            room.setPricePerMonth(json.get("price").getAsDouble());
        }
        if (json.has("depositAmount")) {
            room.setDepositAmount(json.get("depositAmount").getAsDouble());
        }
        if (json.has("maxOccupants")) {
            room.setMaxOccupants(json.get("maxOccupants").getAsInt());
        }
        if (json.has("electricityPricePerKwh")) {
            room.setElectricityPricePerKwh(json.get("electricityPricePerKwh").getAsDouble());
        }
        if (json.has("waterPricePerM3")) {
            room.setWaterPricePerM3(json.get("waterPricePerM3").getAsDouble());
        }
        if (json.has("wifiFee")) {
            room.setWifiFee(json.get("wifiFee").getAsDouble());
        }
        if (json.has("parkingFee")) {
            room.setParkingFee(json.get("parkingFee").getAsDouble());
        }
        if (json.has("roomStatus")) {
            room.setRoomStatus(json.get("roomStatus").getAsString());
        } else if (json.has("status")) {
            room.setRoomStatus(json.get("status").getAsString());
        }
        if (json.has("hasAirConditioner")) {
            room.setHasAirConditioner(json.get("hasAirConditioner").getAsBoolean());
        }
        if (json.has("hasWaterHeater")) {
            room.setHasWaterHeater(json.get("hasWaterHeater").getAsBoolean());
        }
        if (json.has("hasPrivateBathroom")) {
            room.setHasPrivateBathroom(json.get("hasPrivateBathroom").getAsBoolean());
        }
        if (json.has("hasKitchen")) {
            room.setHasKitchen(json.get("hasKitchen").getAsBoolean());
        }
        if (json.has("allowPet")) {
            room.setAllowPet(json.get("allowPet").getAsBoolean());
        }
        if (json.has("description")) {
            room.setDescription(json.get("description").isJsonNull() ? null : json.get("description").getAsString());
        }
        if (json.has("displayOrder")) {
            // no-op placeholder to avoid unused
        }

        return room;
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
