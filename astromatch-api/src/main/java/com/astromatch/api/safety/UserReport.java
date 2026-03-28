package com.astromatch.api.safety;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_reports")
public class UserReport {

	@Id
	@Column(columnDefinition = "UUID")
	private UUID id;

	@Column(name = "reporter_id", nullable = false, columnDefinition = "UUID")
	private UUID reporterId;

	@Column(name = "reported_user_id", nullable = false, columnDefinition = "UUID")
	private UUID reportedUserId;

	@Column(name = "context_type", nullable = false, length = 32)
	private String contextType;

	@Column(name = "reason_code", nullable = false, length = 64)
	private String reasonCode;

	@Column(length = 2000)
	private String detail;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 16)
	private ReportStatus status = ReportStatus.OPEN;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "resolved_at")
	private Instant resolvedAt;

	@Column(name = "resolution_note", length = 2000)
	private String resolutionNote;

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public UUID getReporterId() {
		return reporterId;
	}

	public void setReporterId(UUID reporterId) {
		this.reporterId = reporterId;
	}

	public UUID getReportedUserId() {
		return reportedUserId;
	}

	public void setReportedUserId(UUID reportedUserId) {
		this.reportedUserId = reportedUserId;
	}

	public String getContextType() {
		return contextType;
	}

	public void setContextType(String contextType) {
		this.contextType = contextType;
	}

	public String getReasonCode() {
		return reasonCode;
	}

	public void setReasonCode(String reasonCode) {
		this.reasonCode = reasonCode;
	}

	public String getDetail() {
		return detail;
	}

	public void setDetail(String detail) {
		this.detail = detail;
	}

	public ReportStatus getStatus() {
		return status;
	}

	public void setStatus(ReportStatus status) {
		this.status = status;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Instant createdAt) {
		this.createdAt = createdAt;
	}

	public Instant getResolvedAt() {
		return resolvedAt;
	}

	public void setResolvedAt(Instant resolvedAt) {
		this.resolvedAt = resolvedAt;
	}

	public String getResolutionNote() {
		return resolutionNote;
	}

	public void setResolutionNote(String resolutionNote) {
		this.resolutionNote = resolutionNote;
	}

	@PrePersist
	void prePersist() {
		if (id == null) {
			id = UUID.randomUUID();
		}
		if (createdAt == null) {
			createdAt = Instant.now();
		}
	}
}
