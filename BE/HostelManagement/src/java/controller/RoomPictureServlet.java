package controller;

import com.google.gson.JsonObject;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import model.RoomPicture;
import service.RoomPictureService;
import util.JSONHelper;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@WebServlet("/api/room-pictures/*")
public class RoomPictureServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;
    private RoomPictureService roomPictureService;

    @Override
    public void init() throws ServletException {
        super.init();
        roomPictureService = new RoomPictureService();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*");

        PrintWriter out = response.getWriter();

        try {
            String pathInfo = request.getPathInfo();
            String primaryParam = request.getParameter("primary");
            String roomIdParam = request.getParameter("roomId");

            if (pathInfo != null && pathInfo.length() > 1) {
                int pictureId = Integer.parseInt(pathInfo.substring(1));
                RoomPicture picture = roomPictureService.findById(pictureId);
                if (picture == null) {
                    sendNotFound(response, out, "Không tìm thấy ảnh");
                    return;
                }
                response.setStatus(HttpServletResponse.SC_OK);
                out.print(JSONHelper.toJSON(picture));
                out.flush();
                return;
            }

            if (roomIdParam != null) {
                int roomId = Integer.parseInt(roomIdParam);
                if ("true".equalsIgnoreCase(primaryParam)) {
                    RoomPicture picture = roomPictureService.findPrimaryByRoomId(roomId);
                    if (picture == null) {
                        sendNotFound(response, out, "Không tìm thấy ảnh chính");
                        return;
                    }
                    response.setStatus(HttpServletResponse.SC_OK);
                    out.print(JSONHelper.toJSON(picture));
                    out.flush();
                    return;
                }
                List<RoomPicture> pictures = roomPictureService.findByRoomId(roomId);
                response.setStatus(HttpServletResponse.SC_OK);
                out.print(JSONHelper.toJSON(pictures));
                out.flush();
                return;
            }

            List<RoomPicture> pictures = roomPictureService.findAll();
            response.setStatus(HttpServletResponse.SC_OK);
            out.print(JSONHelper.toJSON(pictures));
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
            if (!json.has("roomId") || !json.has("pictureUrl")) {
                sendBadRequest(response, out, "Thiếu roomId hoặc pictureUrl");
                return;
            }

            RoomPicture picture = buildPictureFromJson(json, null);
            RoomPicture created = roomPictureService.create(picture);
            if (created == null) {
                sendBadRequest(response, out, "Không thể tạo ảnh mới");
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
                sendBadRequest(response, out, "Thiếu id ảnh");
                return;
            }

            int pictureId = Integer.parseInt(pathInfo.substring(1));
            RoomPicture existing = roomPictureService.findById(pictureId);
            if (existing == null) {
                sendNotFound(response, out, "Không tìm thấy ảnh");
                return;
            }

            JsonObject json = JSONHelper.parseJSONRequest(request);
            RoomPicture updated = buildPictureFromJson(json, existing);
            updated.setPictureId(pictureId);
            updated.setRoomId(existing.getRoomId());

            boolean success = roomPictureService.update(updated);
            if (!success) {
                sendBadRequest(response, out, "Không thể cập nhật ảnh");
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
                sendBadRequest(response, out, "Thiếu id ảnh");
                return;
            }

            int pictureId = Integer.parseInt(pathInfo.substring(1));
            boolean ok = roomPictureService.delete(pictureId);
            if (!ok) {
                sendBadRequest(response, out, "Không thể xóa ảnh");
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

    private RoomPicture buildPictureFromJson(JsonObject json, RoomPicture base) {
        RoomPicture picture = base != null ? base : new RoomPicture();
        if (json.has("roomId")) {
            picture.setRoomId(json.get("roomId").getAsInt());
        }
        if (json.has("pictureUrl")) {
            picture.setPictureUrl(json.get("pictureUrl").getAsString());
        }
        if (json.has("pictureDescription")) {
            picture.setPictureDescription(json.get("pictureDescription").isJsonNull()
                    ? null : json.get("pictureDescription").getAsString());
        }
        if (json.has("isPrimary")) {
            picture.setPrimary(json.get("isPrimary").getAsBoolean());
        }
        if (json.has("displayOrder")) {
            picture.setDisplayOrder(json.get("displayOrder").getAsInt());
        } else if (picture.getDisplayOrder() == 0) {
            picture.setDisplayOrder(0);
        }
        return picture;
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


