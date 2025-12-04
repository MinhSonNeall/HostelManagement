package service;

import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Random;
import org.json.JSONArray;
import org.json.JSONObject;

public class VietQRService {
    
    // Cấu hình ngân hàng
    private static final String BANK_SHORT_NAME = "mbbank";  // Lowercase
    private static final String ACCOUNT_NO = "6030092003";  // Số TK
    private static final String ACCOUNT_NAME = "Ngo Minh Son";  // Tên TK
    private static final String TEMPLATE = "compact2";
    
    // API constants
    // Lấy API Key từ: https://casso.vn -> Đăng nhập -> Thiết lập -> API Keys -> Tạo API Key mới
    // Sau đó copy API Key và paste vào đây
    private static final String API_KEY = "AK_CS.ebf5bbe0621911f0b2ed09df87a53c97.Yjqk0TBQIcxfl4dFU7tDEONrlqXEcewx2NLPeo7KWLgdWiLwCTWMTFLFizUzzmflaCkGrdgG";
    
    // Endpoint API của Casso để lấy danh sách giao dịch
    // Format: https://oauth.casso.vn/v2/transactions?fromDate={fromDate}&toDate={toDate}&page=1&pageSize=100&sort=DESC
    private static final String API_GET_PAID = "https://oauth.casso.vn/v2/transactions?fromDate=%s&toDate=%s&page=1&pageSize=100&sort=DESC";
    
    /**
     * Tạo mã QR code thanh toán VietQR
     * @param amount Số tiền cần thanh toán
     * @param bookingId ID của booking
     * @param randomCode Mã code ngẫu nhiên để xác định giao dịch
     * @return URL của QR code
     */
    public String generateQRCode(double amount, int bookingId, int randomCode) {
        try {
            String normalizedInfo = "Booking " + bookingId + " code " + randomCode;
            String addInfo = URLEncoder.encode(normalizedInfo, "UTF-8");
            String accountName = URLEncoder.encode(ACCOUNT_NAME, "UTF-8");
            int amountInt = (int) amount;
            
            String qrUrl = String.format(
                "https://img.vietqr.io/image/%s-%s-%s.png?amount=%d&addInfo=%s&accountName=%s",
                BANK_SHORT_NAME.toLowerCase(),
                ACCOUNT_NO,
                TEMPLATE,
                amountInt,
                addInfo,
                accountName
            );
            
            return qrUrl;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
    
    /**
     * Tạo mã code ngẫu nhiên 6 chữ số
     */
    public int generateRandomCode() {
        Random random = new Random();
        return 100000 + random.nextInt(900000);
    }
    
    /**
     * Kiểm tra thanh toán đã được thực hiện chưa
     * @param description Mô tả giao dịch (chứa bookingId và code)
     * @param amount Số tiền cần kiểm tra
     * @return true nếu đã thanh toán, false nếu chưa
     */
    public boolean checkPayment(String description, int amount) {
        // Lấy ngày từ hôm qua đến hôm nay
        LocalDate today = LocalDate.now();
        String fromDate = today.minusDays(1).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        String toDate = today.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        
        String apiUrl = String.format(API_GET_PAID, fromDate, toDate);
        
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest req = HttpRequest.newBuilder()
                    .uri(java.net.URI.create(apiUrl))
                    .header("Authorization", "Apikey " + API_KEY)
                    .header("Accept", "application/json")
                    .GET()
                    .build();
            
            HttpResponse<String> res = client.send(req, HttpResponse.BodyHandlers.ofString());
            
            if (res.statusCode() != 200) {
                System.out.println("HTTP error: " + res.statusCode());
                return false;
            }
            
            JSONObject json = new JSONObject(res.body());
            
            if (json.getInt("error") != 0) {
                System.out.println("API error: " + json.getString("message"));
                return false;
            }
            
            JSONArray records = json.getJSONObject("data").getJSONArray("records");
            
            for (int i = 0; i < records.length(); i++) {
                JSONObject record = records.getJSONObject(i);
                String recordDesc = record.getString("description").trim().toLowerCase();
                int recordAmount = record.getInt("amount");
                
                System.out.println("Chi tiết giao dịch: " + recordDesc);
                System.out.println("Số tiền: " + recordAmount);
                
                // Kiểm tra description có chứa thông tin booking và số tiền khớp
                if (recordDesc.contains(description.trim().toLowerCase()) && recordAmount == amount) {
                    System.out.println("Thanh toán thành công!");
                    return true;
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error checking payment: " + e.getMessage());
            e.printStackTrace();
        }
        
        return false;
    }
    
    /**
     * Kiểm tra thanh toán bằng bookingId và code
     */
    public boolean checkPaymentByBooking(int bookingId, int code, int amount) {
        String description = "booking " + bookingId + " code " + code;
        return checkPayment(description, amount);
    }
}

