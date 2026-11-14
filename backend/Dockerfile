# ==========================================
# WorkForce 360 - Spring Boot Backend Dockerfile
# Multi-stage production build for Render / Cloud
# ==========================================

# --- Stage 1: Build the application ---
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package application
COPY src ./src
RUN mvn clean package -DskipTests -B

# --- Stage 2: Production JRE runtime ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create a non-root group and user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built jar from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Render passes dynamic PORT environment variable (defaulting to 8080)
ENV PORT=8080
EXPOSE ${PORT}

# Run with container-aware memory constraints
ENTRYPOINT ["sh", "-c", "java -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dserver.port=${PORT} -jar app.jar"]

