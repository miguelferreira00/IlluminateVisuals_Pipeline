# ===================================================================
# Multi-stage Dockerfile para Spring Boot 3.3 + Java 21
# Backend: Illuminate Visuals CRM
# ===================================================================

# --- Stage 1: Build ---
FROM maven:3.9.5-eclipse-temurin-21-jammy AS builder

WORKDIR /app

# Copiar apenas o backend
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src

# Build (skip tests para ser mais rápido)
RUN mvn clean package -DskipTests

# --- Stage 2: Runtime ---
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copiar JAR do stage anterior
COPY --from=builder /app/target/*.jar app.jar

# Porta padrão (pode ser overridden em Railway)
EXPOSE 8082

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8082/actuator/health || exit 1

# Entry point
ENTRYPOINT ["java", "-jar", "app.jar"]
