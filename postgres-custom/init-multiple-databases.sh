#!/bin/bash
set -e
set -u

function create_user_and_database() {
    local database=$1
    echo "Creating database '$database'"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="$POSTGRES_DB" <<-EOSQL
        CREATE DATABASE $database;
        GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRES_USER;
EOSQL
}

if [ -n "${POSTGRES_MULTIPLE_DATABASES:-}" ]; then
    echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
    for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
        # Only create database if it doesn't already exist
        if [ "$db" != "$POSTGRES_DB" ]; then
            create_user_and_database $db
        else
            echo "Database '$db' is the default database, skipping creation"
        fi
    done
    echo "Multiple databases created successfully"
else
    echo "POSTGRES_MULTIPLE_DATABASES not set, skipping additional database creation"
fi