#!/bin/bash

# AutoApply Project Setup Script
# This script sets up the complete AutoApply project

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "🚀 Starting AutoApply Project Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

# Check Java
if ! command -v java &> /dev/null; then
    echo -e "${YELLOW}⚠️  Java not found. Please install Java 17+${NC}"
    exit 1
fi
echo "✅ Java found: $(java -version 2>&1 | head -n 1)"

# Check Gradle
if ! command -v gradle &> /dev/null; then
    echo -e "${YELLOW}⚠️  Gradle not found. Checking for Gradle wrapper...${NC}"
    if [ ! -f "backend/gradlew" ]; then
        echo -e "${YELLOW}⚠️  Gradle wrapper not found. Please install Gradle 8.5+ or use wrapper${NC}"
        exit 1
    fi
    echo "✅ Gradle wrapper found"
    USE_WRAPPER=true
else
    echo "✅ Gradle found: $(gradle -v | head -n 1)"
    USE_WRAPPER=false
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo "✅ Node.js found: $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}⚠️  npm not found. Please install npm${NC}"
    exit 1
fi
echo "✅ npm found: $(npm -v)"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL client not found. Please install PostgreSQL${NC}"
    echo "   Database setup will be skipped. You can run it manually later."
    SKIP_DB=true
else
    echo "✅ PostgreSQL client found"
    SKIP_DB=false
fi

echo ""
echo -e "${BLUE}Setting up backend...${NC}"
cd backend

# Build backend with Gradle
echo "Building Spring Boot services..."
if [ "$USE_WRAPPER" = true ]; then
    chmod +x gradlew
    ./gradlew build -x test
else
    gradle build -x test
fi

echo -e "${GREEN}✅ Backend setup complete!${NC}"
cd ..

echo ""
echo -e "${BLUE}Setting up frontend...${NC}"
cd frontend

# Install frontend dependencies
echo "Installing npm dependencies..."
npm install

echo -e "${GREEN}✅ Frontend setup complete!${NC}"
cd ..

echo ""
echo -e "${BLUE}Setting up environment files...${NC}"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file from .env.example${NC}"
    echo -e "${YELLOW}⚠️  Please update .env with your actual configuration${NC}"
else
    echo "✅ .env file already exists"
fi

echo ""
if [ "$SKIP_DB" = false ]; then
    echo -e "${BLUE}Database setup...${NC}"
    echo -e "${YELLOW}To set up the database, run:${NC}"
    echo "  psql -U postgres -c 'CREATE DATABASE autoapply;'"
    echo "  psql -U postgres -d autoapply -f database/migrations/001_initial_schema.sql"
    echo ""
    read -p "Do you want to set up the database now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Creating database..."
        psql -U postgres -c "CREATE DATABASE autoapply;" 2>/dev/null || echo "Database may already exist"
        echo "Running migrations..."
        psql -U postgres -d autoapply -f database/migrations/001_initial_schema.sql
        echo -e "${GREEN}✅ Database setup complete!${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Database setup skipped (PostgreSQL client not found)${NC}"
    echo "   To set up manually:"
    echo "   psql -U postgres -c 'CREATE DATABASE autoapply;'"
    echo "   psql -U postgres -d autoapply -f database/migrations/001_initial_schema.sql"
fi

echo ""
echo -e "${BLUE}Creating browser extension icons...${NC}"
cd browser-extension/icons

# Create simple placeholder icons using ImageMagick if available, or provide instructions
if command -v convert &> /dev/null; then
    echo "Creating placeholder icons..."
    convert -size 16x16 xc:#2563eb -pointsize 10 -fill white -gravity center -annotate +0+0 "AA" icon16.png 2>/dev/null || echo "Could not create icon16.png"
    convert -size 48x48 xc:#2563eb -pointsize 24 -fill white -gravity center -annotate +0+0 "AA" icon48.png 2>/dev/null || echo "Could not create icon48.png"
    convert -size 128x128 xc:#2563eb -pointsize 64 -fill white -gravity center -annotate +0+0 "AA" icon128.png 2>/dev/null || echo "Could not create icon128.png"
    echo -e "${GREEN}✅ Icons created!${NC}"
else
    echo -e "${YELLOW}⚠️  ImageMagick not found. Please create icon files manually:${NC}"
    echo "   - icon16.png (16x16 pixels)"
    echo "   - icon48.png (48x48 pixels)"
    echo "   - icon128.png (128x128 pixels)"
    echo "   You can use any image editor or online icon generator."
fi

cd ../..

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update .env file with your database credentials and JWT secret"
echo "2. Start PostgreSQL and Redis services"
echo "3. Start backend services (run each service separately or use Docker Compose)"
echo "4. Start frontend: cd frontend && npm run dev"
echo "5. Load browser extension from browser-extension folder"
echo ""
echo -e "${BLUE}To start services:${NC}"
if [ "$USE_WRAPPER" = true ]; then
    echo "  Backend: cd backend && ./gradlew :<service-name>:bootRun"
else
    echo "  Backend: cd backend && gradle :<service-name>:bootRun"
fi
echo "  Frontend: cd frontend && npm run dev"
echo ""

