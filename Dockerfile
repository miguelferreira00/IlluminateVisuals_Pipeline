FROM maven:3.9.5-openjdk-21-slim as builder

WORKDIR /app
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src

RUN mvn clean package -DskipTests -q

FROM openjdk:21-slim

WORKDIR /app
COPY --from=builder /app/target/crm-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
