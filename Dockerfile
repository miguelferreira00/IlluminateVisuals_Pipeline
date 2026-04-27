# Build
FROM maven:3.9-sapmachine-21 as build
WORKDIR /workspace
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn clean package -DskipTests

# Runtime
FROM sapmachine:21-jre-ubuntu
WORKDIR /app
COPY --from=build /workspace/target/crm-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
