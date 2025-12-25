# Database Migrations

## Setup

1. Ensure PostgreSQL is installed and running
2. Create the database:
   ```sql
   CREATE DATABASE autoapply;
   ```

3. Run migrations in order:
   ```bash
   psql -U postgres -d autoapply -f migrations/001_initial_schema.sql
   ```

## Schema Overview

- **users**: User accounts (auth-service)
- **profiles**: User profiles with personal information
- **experiences**: Work experience entries
- **education**: Education history
- **skills**: User skills
- **job_applications**: Tracked job applications
- **resume_versions**: Tailored resume versions

## Environment Variables

Set these in your Spring Boot application:
- `DB_USERNAME`: PostgreSQL username (default: postgres)
- `DB_PASSWORD`: PostgreSQL password (default: postgres)
- Database URL: `jdbc:postgresql://localhost:5432/autoapply`

