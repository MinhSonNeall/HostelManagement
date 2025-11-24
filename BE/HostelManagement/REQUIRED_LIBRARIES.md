# Danh Sách Thư Viện Cần Thiết

Dựa trên code đã tạo, bạn cần các thư viện sau:

## 1. Gson (BẮT BUỘC) ⚠️

**Mục đích**: Xử lý JSON request/response từ frontend

**File cần tải**: `gson-2.10.1.jar` (hoặc version mới hơn)

**Download**:
- Direct: https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar
- Maven Repository: https://mvnrepository.com/artifact/com.google.code.gson/gson

**Sử dụng trong**:
- `util/JSONHelper.java` - Parse và convert JSON
- `controller/LoginServlet.java` - Xử lý JSON request/response

---

## 2. Jakarta Servlet API 6 (Jakarta EE 10)

**Mục đích**: Servlet API cho Java web application (namespace `jakarta.*`)

**File**: `jakarta.servlet-api-6.0.0.jar` (hoặc version tương ứng với server Jakarta EE bạn dùng)

**Lưu ý**: 
- Nếu dùng Tomcat 10+, thư viện Jakarta Servlet đã có sẵn
- Nếu compile trong IDE (NetBeans, IntelliJ), có thể cần thêm vào project libraries
- Chắc chắn sử dụng phiên bản servlet phù hợp với server (Servlet 6.0 cho Jakarta EE 10)

**Download** (nếu cần):
- https://mvnrepository.com/artifact/jakarta.servlet/jakarta.servlet-api

**Sử dụng trong**:
- `controller/LoginServlet.java` - Tất cả servlet classes

---

## 3. JDBC Driver (NẾU DÙNG DATABASE)

**Mục đích**: Kết nối database (MySQL, PostgreSQL, SQL Server, v.v.)

**Tùy chọn theo database bạn dùng**:

### MySQL
- **File**: `mysql-connector-java-8.0.33.jar` (hoặc version mới hơn)
- **Download**: https://dev.mysql.com/downloads/connector/j/
- **Maven**: `mysql:mysql-connector-java:8.0.33`

### PostgreSQL
- **File**: `postgresql-42.6.0.jar` (hoặc version mới hơn)
- **Download**: https://jdbc.postgresql.org/download/
- **Maven**: `org.postgresql:postgresql:42.6.0`

### SQL Server
- **File**: `mssql-jdbc-12.4.0.jre8.jar` (hoặc version mới hơn)
- **Download**: https://learn.microsoft.com/en-us/sql/connect/jdbc/download-microsoft-jdbc-driver-for-sql-server

**Sử dụng trong**:
- `dao/UserDAO.java` - Kết nối và query database

---

## Cách Cài Đặt

### Bước 1: Tạo thư mục lib
```
web/
  WEB-INF/
    lib/  ← Tạo thư mục này
```

### Bước 2: Download và đặt JAR files
Đặt tất cả file `.jar` vào thư mục `web/WEB-INF/lib/`

### Bước 3: Thêm vào Project (NetBeans)
1. Right-click project → **Properties**
2. Chọn **Libraries** → **Compile** tab
3. Click **Add JAR/Folder...**
4. Chọn các file JAR từ `web/WEB-INF/lib/`
5. Click **OK**

### Bước 4: Thêm vào Project (IntelliJ IDEA)
1. File → **Project Structure** (Ctrl+Alt+Shift+S)
2. Chọn **Libraries** → Click **+** → **Java**
3. Chọn thư mục `web/WEB-INF/lib/`
4. Click **OK**

---

## Tóm Tắt File Cần Tải

| Thư Viện | File JAR | Bắt Buộc | Link Download |
|----------|----------|----------|---------------|
| **Gson** | `gson-2.10.1.jar` | ✅ **CÓ** | https://repo1.maven.org/maven2/com/google/code/gson/gson/2.10.1/gson-2.10.1.jar |
| **Jakarta Servlet API** | `jakarta.servlet-api-6.0.0.jar` | ⚠️ Tùy IDE | https://mvnrepository.com/artifact/jakarta.servlet/jakarta.servlet-api |
| **JDBC Driver** | Tùy database | ⚠️ Nếu dùng DB | Xem trên |

---

## Kiểm Tra Sau Khi Thêm

Sau khi thêm thư viện, compile project và kiểm tra:
- ✅ Không còn lỗi `package com.google.gson does not exist`
- ✅ Không còn lỗi `package javax.servlet does not exist`
- ✅ Project compile thành công

---

## Lưu Ý Quan Trọng

1. **Gson là BẮT BUỘC** - Không có Gson, code sẽ không compile được
2. **Servlet API** - Thường có sẵn nếu dùng Tomcat, nhưng có thể cần thêm vào IDE
3. **JDBC Driver** - Chỉ cần nếu bạn implement database connection trong `UserDAO`
4. Đảm bảo version Java tương thích (Java 8+)


