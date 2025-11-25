package util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBContext {
    private static final String URL =
        "jdbc:sqlserver://localhost:1433;databaseName=HostelRentalDB;encrypt=true;trustServerCertificate=true";
    private static final String USER = "sa";
    private static final String PASS = "123";

    static {
        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("Cannot load SQLServer JDBC Driver", e);
        }
    }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASS);
    }
    
    public static void main(String[] args) {
        try (Connection conn = DBContext.getConnection()) {
            if (conn != null) {
                System.out.println("Kết nối thành công tới SQL Server!");
            } else {
                System.out.println("Kết nối thất bại!");
            }
        } catch (SQLException e) {
            System.out.println("Lỗi khi kết nối DB:");
            e.printStackTrace();
        }
    }
}
