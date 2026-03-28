package com.astromatch.api.safety;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserReportRepository extends JpaRepository<UserReport, UUID> {

	List<UserReport> findByStatusOrderByCreatedAtDesc(ReportStatus status);
}
