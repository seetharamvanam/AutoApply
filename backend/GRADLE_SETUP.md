# Gradle Setup Instructions

## Initial Setup

The project uses Gradle as the build tool. The Gradle wrapper is included, so you don't need to install Gradle separately.

### First Time Setup

If the Gradle wrapper JAR file is missing, you'll need to generate it:

**Option 1: Using installed Gradle**
```bash
cd backend
gradle wrapper --gradle-version 8.5
```

**Option 2: Download wrapper manually**
1. Download `gradle-wrapper.jar` from: https://raw.githubusercontent.com/gradle/gradle/v8.5.0/gradle/wrapper/gradle-wrapper.jar
2. Place it in `backend/gradle/wrapper/gradle-wrapper.jar`

### Using the Gradle Wrapper

**Linux/Mac:**
```bash
cd backend
chmod +x gradlew
./gradlew build
```

**Windows:**
```powershell
cd backend
.\gradlew.bat build
```

## Common Gradle Commands

### Build all services
```bash
./gradlew build -x test
```

### Run a specific service
```bash
./gradlew :gateway-service:bootRun
./gradlew :auth-service:bootRun
./gradlew :profile-service:bootRun
./gradlew :job-parser-service:bootRun
./gradlew :resume-tailor-service:bootRun
./gradlew :application-tracker-service:bootRun
```

### Clean build
```bash
./gradlew clean build
```

### Run tests
```bash
./gradlew test
```

### Build without tests
```bash
./gradlew build -x test
```

## Project Structure

- `settings.gradle` - Defines all subprojects
- `build.gradle` - Root build file with common configuration
- `gradle.properties` - Gradle configuration properties
- Each service has its own `build.gradle` file

## Migrating from Maven

If you have existing Maven builds, the Gradle build files have been created to match the Maven configuration. All dependencies and plugins are equivalent.

## Troubleshooting

### Gradle wrapper not executable (Linux/Mac)
```bash
chmod +x backend/gradlew
```

### Gradle wrapper JAR missing
Run: `gradle wrapper` (if Gradle is installed) or download manually (see above)

### Build fails
- Ensure Java 17+ is installed and JAVA_HOME is set
- Check `gradle.properties` for correct configuration
- Try: `./gradlew clean build --refresh-dependencies`

