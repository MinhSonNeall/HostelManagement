package config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBContext {
    private static final String SERVER = "localhost";
    private static final String PORT = "1433";
    private static final String DATABASE = "HostelRentalDB";
    private static final String USERNAME = "sa";
    private static final String PASSWORD = "123";
    
    private static final String CONNECTION_URL = String.format(
        "jdbc:sqlserver://%s:%s;databaseName=%s;encrypt=false;trustServerCertificate=true",
        SERVER, PORT, DATABASE
    );
    
    static {
        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }
    
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(CONNECTION_URL, USERNAME, PASSWORD);
    }
    
    public static void closeConnection(Connection conn) {
        if (conn != null) {
            try { conn.close(); } catch (SQLException e) { e.printStackTrace(); }
        }
    }
}
