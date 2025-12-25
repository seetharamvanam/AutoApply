#!/bin/bash

# Database setup script for AutoApply
# Usage: ./database/setup-database.sh

set -e

echo "🗄️  Setting up AutoApply Database..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Default values
DB_USER="${DB_USER:-postgres}"
DB_NAME="${DB_NAME:-autoapply}"
MIGRATION_FILE="database/migrations/001_initial_schema.sql"

# Check if PostgreSQL is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL client (psql) not found${NC}"
    echo "Please install PostgreSQL and ensure psql is in your PATH"
    exit 1
fi

echo -e "${BLUE}Using database: $DB_NAME${NC}"
echo -e "${BLUE}Using user: $DB_USER${NC}"
echo ""

# Prompt for password
read -sp "Enter PostgreSQL password for user $DB_USER: " DB_PASSWORD
echo ""

export PGPASSWORD=$DB_PASSWORD

# Create database
echo -e "${BLUE}Creating database '$DB_NAME'...${NC}"
psql -U "$DB_USER" -h localhost -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' may already exist, continuing...${NC}"
}

# Run migrations
echo -e "${BLUE}Running migrations...${NC}"
if psql -U "$DB_USER" -h localhost -d "$DB_NAME" -f "$MIGRATION_FILE"; then
    echo ""
    echo -e "${GREEN}✅ Database setup complete!${NC}"
    echo ""
    echo "Database '$DB_NAME' is ready to use."
else
    echo -e "${RED}❌ Migration failed${NC}"
    exit 1
fi

unset PGPASSWORD

