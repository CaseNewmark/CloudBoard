FROM postgres:16-alpine

# Copy the initialization script
COPY init-multiple-databases.sh /docker-entrypoint-initdb.d/

# Make sure the script is executable
RUN chmod +x /docker-entrypoint-initdb.d/init-multiple-databases.sh

# Set default environment variables
ENV POSTGRES_MULTIPLE_DATABASES=cloudboard,keycloak