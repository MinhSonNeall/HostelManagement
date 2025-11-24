# Dependencies

## Required Libraries

Để chạy được LoginServlet, bạn cần thêm các thư viện sau vào `web/WEB-INF/lib/`:

### 1. Gson (JSON Processing)
- **File**: `gson-2.10.1.jar` (hoặc version mới hơn)
- **Download**: https://mvnrepository.com/artifact/com.google.code.gson/gson
- **Mục đích**: Xử lý JSON request/response

### 2. Jakarta Servlet API (phiên bản 6.0 nếu dùng Jakarta EE 10)
- **File**: `jakarta.servlet-api-6.0.0.jar` (hoặc version tương ứng với server bạn dùng)
- **Mục đích**: Servlet API cho Java (namespace `jakarta.*`)

## Cách thêm dependencies

1. Tạo thư mục `web/WEB-INF/lib/` nếu chưa có
2. Download Gson JAR file và đặt vào `web/WEB-INF/lib/`
3. Trong NetBeans/IDE, thêm JAR vào project libraries:
   - Right-click project → Properties → Libraries → Add JAR/Folder
   - Chọn file JAR từ `web/WEB-INF/lib/`

## Cấu trúc thư mục

```
web/
  WEB-INF/
    lib/
      gson-2.10.1.jar
      jakarta.servlet-api-6.0.0.jar
```

## Lưu ý

- Nếu sử dụng Maven, có thể thêm vào `pom.xml`:
  ```xml
  <dependency>
      <groupId>com.google.code.gson</groupId>
      <artifactId>gson</artifactId>
      <version>2.10.1</version>
  </dependency>
  ```

