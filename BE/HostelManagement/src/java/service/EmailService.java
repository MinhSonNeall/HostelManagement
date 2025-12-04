package service;

import jakarta.mail.*;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;
import java.util.Random;

public class EmailService {
    
    // Cấu hình SMTP Gmail
    private static final String SMTP_HOST = "smtp.gmail.com";
    private static final String SMTP_PORT = "587";
    
    // Thông tin email để gửi OTP
    private static final String SMTP_USER = "sonvd74@gmail.com";
    private static final String SMTP_PASSWORD = "xgfs dqfr pdpy icrr"; // App Password từ Gmail
    
    /**
     * Tạo OTP ngẫu nhiên 6 chữ số
     */
    public String generateOTP() {
        Random random = new Random();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }
    
    /**
     * Gửi email OTP để reset password
     */
    public boolean sendOTPEmail(String toEmail, String otp, String userName) {
        return sendOTPEmail(toEmail, otp, userName, "Mã OTP đặt lại mật khẩu - Hostel Management", "đặt lại mật khẩu");
    }
    
    /**
     * Gửi email OTP để xác thực đăng ký
     */
    public boolean sendRegisterOTPEmail(String toEmail, String otp, String userName) {
        return sendOTPEmail(toEmail, otp, userName, "Mã OTP xác thực đăng ký - Hostel Management", "xác thực đăng ký tài khoản");
    }
    
    /**
     * Gửi email OTP (method chung)
     */
    private boolean sendOTPEmail(String toEmail, String otp, String userName, String subject, String purpose) {
        try {
            Properties props = new Properties();
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.host", SMTP_HOST);
            props.put("mail.smtp.port", SMTP_PORT);
            
            Session session = Session.getInstance(props, new Authenticator() {
                @Override
                protected PasswordAuthentication getPasswordAuthentication() {
                    return new PasswordAuthentication(SMTP_USER, SMTP_PASSWORD);
                }
            });
            
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(SMTP_USER));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(toEmail));
            message.setSubject(subject);
            
            String htmlContent = "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }" +
                ".content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }" +
                ".otp-box { background-color: #fff; border: 3px solid #4F46E5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }" +
                ".otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px; }" +
                ".footer { margin-top: 20px; font-size: 12px; color: #666; text-align: center; }" +
                ".warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>Mã OTP đặt lại mật khẩu</h1>" +
                "</div>" +
                "<div class='content'>" +
                "<p>Xin chào <strong>" + userName + "</strong>,</p>" +
                "<p>Chúng tôi nhận được yêu cầu " + purpose + " cho tài khoản của bạn.</p>" +
                "<p>Vui lòng sử dụng mã OTP sau để xác thực:</p>" +
                "<div class='otp-box'>" +
                "<div class='otp-code'>" + otp + "</div>" +
                "</div>" +
                "<div class='warning'>" +
                "<p><strong>Lưu ý:</strong></p>" +
                "<ul style='margin: 10px 0; padding-left: 20px;'>" +
                "<li>Mã OTP này sẽ hết hạn sau 10 phút</li>" +
                "<li>Không chia sẻ mã OTP với bất kỳ ai</li>" +
                "<li>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email</li>" +
                "</ul>" +
                "</div>" +
                "</div>" +
                "<div class='footer'>" +
                "<p>Trân trọng,<br>Đội ngũ Hostel Management</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
            
            message.setContent(htmlContent, "text/html; charset=UTF-8");
            
            Transport.send(message);
            System.out.println("OTP email sent successfully to: " + toEmail);
            return true;
        } catch (MessagingException e) {
            System.err.println("Failed to send OTP email to: " + toEmail);
            e.printStackTrace();
            return false;
        }
    }
}

