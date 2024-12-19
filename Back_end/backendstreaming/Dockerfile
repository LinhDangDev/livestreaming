# Sử dụng image OpenJDK làm base image
FROM openjdk:23

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy file jar của ứng dụng vào container
COPY target/backendstreaming-0.0.1-SNAPSHOT.jar /app/backendstreaming.jar

# Lệnh để chạy ứng dụng Spring Boot
CMD ["java", "-jar", "backendstreaming.jar"]
