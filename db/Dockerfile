# Cloud Run migrations job. Build context: db.
# Connection comes from FLYWAY_URL, FLYWAY_USER and FLYWAY_PASSWORD at runtime; Neon requires
# ?sslmode=require on the JDBC URL. Keep the version in step with docker-compose.pipeline.*.yml.
FROM flyway/flyway:10.21.0-alpine
COPY migrations /flyway/sql
ENV FLYWAY_LOCATIONS=filesystem:/flyway/sql \
    FLYWAY_CLEAN_DISABLED=true
