package com.autoapply.job.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

@Data
@Builder
public class DashboardStatsDTO {
    private long totalApplied;
    private long totalInterviews;
    private long totalOffers;
    private long totalRejected;
    private Map<String, Long> statusBreakdown;
}
