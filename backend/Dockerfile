# Use a slim JRE image for the final container
FROM eclipse-temurin:21-jre-jammy

# Set the working directory in the final container
WORKDIR /app

# Copy the executable JAR file (built on host) into the container
COPY target/ai-code-review-platform-0.0.1-SNAPSHOT.jar app.jar

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Run the JAR file
ENTRYPOINT ["java", "-jar", "app.jar"]
