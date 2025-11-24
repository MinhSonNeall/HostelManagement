package util;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import jakarta.servlet.http.HttpServletRequest;
import java.io.BufferedReader;
import java.io.IOException;

/**
 * Utility class for JSON processing
 */
public class JSONHelper {
    private static final Gson gson = new Gson();

    /**
     * Parse JSON request body to JsonObject
     */
    public static JsonObject parseJSONRequest(HttpServletRequest request) throws IOException {
        StringBuilder jsonBuffer = new StringBuilder();
        String line;
        try (BufferedReader reader = request.getReader()) {
            while ((line = reader.readLine()) != null) {
                jsonBuffer.append(line);
            }
        }
    JsonParser parser = new JsonParser();
return parser.parse(jsonBuffer.toString()).getAsJsonObject();
    }

    /**
     * Convert object to JSON string
     */
    public static String toJSON(Object obj) {
        return gson.toJson(obj);
    }

    /**
     * Convert JSON string to object
     */
    public static <T> T fromJSON(String json, Class<T> classOfT) {
        return gson.fromJson(json, classOfT);
    }
}

