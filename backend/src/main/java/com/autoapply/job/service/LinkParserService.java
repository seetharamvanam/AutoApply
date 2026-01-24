package com.autoapply.job.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import com.autoapply.job.dto.JobApplicationDTO;

import java.io.IOException;

@Service
@Slf4j
public class LinkParserService {

    public JobApplicationDTO parseJobLink(String url) {
        log.info("Parsing data from URL: {}", url);
        JobApplicationDTO jobDto = new JobApplicationDTO();
        jobDto.setUrl(url);

        try {
            Document doc = Jsoup.connect(url)
                    .userAgent(
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                    .get();

            // Basic extraction heuristics
            String title = doc.title();
            // TODO: Add more specific selectors for LinkedIn, Indeed, etc.

            jobDto.setTitle(title);
            // Description might be the body text or specific meta tags
            String description = doc.select("meta[name=description]").attr("content");
            if (description.isEmpty()) {
                description = doc.body().text().substring(0, Math.min(doc.body().text().length(), 500)) + "...";
            }
            jobDto.setDescription(description);

            // Company name is hard to guess generically without specific selectors
            // Often in title "Role | Company"
            if (title.contains("|")) {
                String[] parts = title.split("\\|");
                if (parts.length > 1) {
                    jobDto.setCompany(parts[1].trim());
                    jobDto.setTitle(parts[0].trim());
                }
            } else if (title.contains(" at ")) {
                String[] parts = title.split(" at ");
                if (parts.length > 1) {
                    jobDto.setCompany(parts[1].trim());
                    jobDto.setTitle(parts[0].trim());
                }
            }

        } catch (IOException e) {
            log.error("Error parsing URL: {}", url, e);
            throw new RuntimeException("Failed to parse job link", e);
        }

        return jobDto;
    }
}
