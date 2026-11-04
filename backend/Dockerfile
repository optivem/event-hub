# syntax=docker/dockerfile:1.4
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src
COPY config config
# Retry the wrapper's distribution download — a transient 5xx from the Gradle CDN
# otherwise kills the build (mirrors npm_config_fetch_retries in the TS images).
RUN --mount=type=cache,target=/root/.gradle \
    chmod +x gradlew && \
    for i in 1 2 3; do \
      ./gradlew --version --no-daemon && break; \
      [ "$i" = 3 ] && { echo "Gradle wrapper download failed after 3 attempts"; exit 1; }; \
      echo "Gradle wrapper download failed (attempt $i/3), retrying in 10s..."; sleep 10; \
    done && \
    ./gradlew bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
# C1 only and a heap sized to the container: faster JVM startup on Cloud Run's 1 vCPU / 1 GiB.
# Set before the training run, so the CDS archive is built with the same flags it runs with.
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:TieredStopAtLevel=1"
COPY --from=build /app/build/libs/*.jar app.jar
# AppCDS: extract the jar, then a training run that starts the Spring context and exits
# (spring.context.exit=onRefresh) writes the loaded classes to app.jsa, which every start reuses.
# The training run has no database or Keycloak: Hibernate skips JDBC metadata, the rest is dummy.
RUN java -Djarmode=tools -jar app.jar extract --destination extracted && rm app.jar && \
    cd extracted && \
    java -XX:ArchiveClassesAtExit=app.jsa -Xlog:cds=error -Dspring.context.exit=onRefresh \
      -Dspring.jpa.hibernate.ddl-auto=none \
      -Dspring.jpa.properties.hibernate.boot.allow_jdbc_metadata_access=false \
      -Dauth.issuer-uri=http://localhost/realms/x -Dauth.jwk-set-uri=http://localhost/certs \
      -Dauth.audience=x -jar app.jar && \
    chown -R app:app /app
WORKDIR /app/extracted
USER app
EXPOSE 8081
HEALTHCHECK --interval=10s --timeout=3s --start-period=30s --retries=5 \
  CMD wget -qO- http://localhost:8081/health || exit 1
ENTRYPOINT ["java", "-XX:SharedArchiveFile=app.jsa", "-jar", "app.jar"]
