# Builder image
FROM maven:3.8.7-openjdk-18-slim as maven
FROM openjdk:18-jdk-slim as builder

# Set up Maven
COPY --from=maven /usr/share/maven /usr/share/maven
RUN ln -s /usr/share/maven/bin/mvn /usr/bin/mvn
ENV MAVEN_HOME=/usr/share/maven

WORKDIR /root

# Copy in source code
COPY src/ /root/src
COPY pom.xml /root/pom.xml

# Build Java application
RUN mvn clean install

# Runtime image
FROM openjdk:18-jdk-slim as runtime

# Add 'ps' command for the Docker healthcheck
RUN apt update && apt install -y procps && apt clean

COPY healthcheck.sh .

# Check if java process is running in container, otherwise container is unhealthy
HEALTHCHECK CMD ["/bin/bash", "-c", "/healthcheck.sh"]

WORKDIR /root/

# Copy in executable JAR (from builder step)
COPY --from=builder /root/target/calibration-info*.jar /root/calibration-info.jar

CMD ["/bin/bash", "-c", "java -jar /root/calibration-info.jar"]

