# ---- Build stage ----
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy build files
COPY . .

# Build the application
RUN ./gradlew clean build -x test

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy jar from build stage
COPY --from=build /app/build/libs/*.jar DocHub-0.0.1-SNAPSHOT.jar

# Expose port (Render uses PORT env var)
EXPOSE 8080

# Start app
CMD ["sh", "-c", "java -jar DocHub-0.0.1-SNAPSHOT.jar"]
