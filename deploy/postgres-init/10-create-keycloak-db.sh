#!/bin/sh
# Runs once, when the Postgres volume is first created: Keycloak gets its own
# database on the same server as the app's.
set -e
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-SQL
	CREATE DATABASE keycloak;
SQL
