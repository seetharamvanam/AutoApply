package com.autoapply;

import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
public class UnifiedServiceApplication {
    private static final Logger log = LoggerFactory.getLogger(UnifiedServiceApplication.class);

    public static void main(String[] args) {
        loadDotEnvToSystemProperties();
        SpringApplication.run(UnifiedServiceApplication.class, args);
    }

    /**
     * Loads .env into System properties for local development.
     *
     * Spring Boot already supports environment variables, but it does NOT
     * automatically read a ".env" file. This bridges that gap so running
     * Gradle/IDE bootRun picks up DB_USERNAME/DB_PASSWORD/etc from project .env.
     *
     * We do NOT override existing environment variables or system properties.
     */
    private static void loadDotEnvToSystemProperties() {
        // We want a single source of truth: repo-root ".env".
        // Gradle bootRun working directory can vary, so we walk upwards until we find "env.example",
        // then load ".env" from that directory.
        Path repoRoot = findRepoRoot();

        String loadedFrom = repoRoot != null ? repoRoot.toString() : "(unknown)";
        Dotenv dotenv = repoRoot != null
                ? Dotenv.configure()
                    .directory(loadedFrom)
                    .ignoreIfMissing()
                    .ignoreIfMalformed()
                    .load()
                : Dotenv.configure()
                    .ignoreIfMissing()
                    .ignoreIfMalformed()
                    .load();

        if (dotenv.entries().isEmpty()) {
            log.info("No usable .env entries loaded. If you have a .env file, ensure it is plain text with KEY=VALUE lines (no stray characters).");
            return;
        }

        log.info("Loaded .env ({} entries) from {}", dotenv.entries().size(), loadedFrom);

        dotenv.entries().forEach(entry -> {
            String key = entry.getKey();
            String value = entry.getValue();

            // Don’t override: environment variables win, then system properties.
            String envValue = System.getenv(key);
            if (envValue != null && !envValue.isBlank()) return;
            String propValue = System.getProperty(key);
            if (propValue != null && !propValue.isBlank()) return;

            if (value != null) {
                System.setProperty(key, value);
            }
        });
    }

    private static Path findRepoRoot() {
        Path dir = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();
        for (int i = 0; i < 5 && dir != null; i++) {
            if (Files.exists(dir.resolve("env.example"))) {
                return dir;
            }
            dir = dir.getParent();
        }
        return null;
    }
}


