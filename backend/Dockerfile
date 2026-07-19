# --- Stage 1: Build the application ---
# Use a Maven image to build the application JAR
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Set the working directory inside the build container
WORKDIR /build

# Copy the pom.xml and the source code
COPY pom.xml .
COPY src ./src

# Build the application and create the executable JAR
# This runs 'mvn clean package' and skips tests for a faster build
RUN mvn clean package -DskipTests

# --- Stage 2: Create the final, lightweight runtime image ---
# Use a slim JRE image for the final container
FROM eclipse-temurin:21-jre-jammy

# Set the working directory in the final container
WORKDIR /app

# Copy the executable JAR file from the 'build' stage
COPY --from=build /build/target/ai-code-review-platform-0.0.1-SNAPSHOT.jar app.jar

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run the JAR file
ENTRYPOINT ["java", "-jar", "app.jar"]
