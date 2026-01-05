# Database Migrations

## Setup

1. Ensure PostgreSQL is installed and running
2. Create the database:
   ```sql
   CREATE DATABASE autoapply;
   ```

3. Run migrations:
   ```bash
   psql -U postgres -d autoapply -f database/migrations/001_initial_schema.sql
   psql -U postgres -d autoapply -f database/migrations/002_add_password_reset_tokens.sql
   psql -U postgres -d autoapply -f database/migrations/003_update_job_application_statuses.sql
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
- `DB_USERNAME`: PostgreSQL username
- `DB_PASSWORD`: PostgreSQL password
- Database URL: `jdbc:postgresql://localhost:5432/autoapply`

