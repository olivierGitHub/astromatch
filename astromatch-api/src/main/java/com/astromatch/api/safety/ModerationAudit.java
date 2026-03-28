package com.astromatch.api.safety;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "moderation_audit")
public class ModerationAudit {

	@Id
	@Column(columnDefinition = "UUID")
	private UUID id;

	@Column(name = "report_id", columnDefinition = "UUID")
	private UUID reportId;

	@Column(name = "actor_label", nullable = false, length = 255)
	private String actorLabel;

	@Column(nullable = false, length = 32)
	private String action;

	@Column(name = "target_user_id", nullable = false, columnDefinition = "UUID")
	private UUID targetUserId;

	@Column(length = 2000)
	private String detail;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public UUID getReportId() {
		return reportId;
	}

	public void setReportId(UUID reportId) {
		this.reportId = reportId;
	}

	public String getActorLabel() {
		return actorLabel;
	}

	public void setActorLabel(String actorLabel) {
		this.actorLabel = actorLabel;
	}

	public String getAction() {
		return action;
	}

	public void setAction(String action) {
		this.action = action;
	}

	public UUID getTargetUserId() {
		return targetUserId;
	}

	public void setTargetUserId(UUID targetUserId) {
		this.targetUserId = targetUserId;
	}

	public String getDetail() {
		return detail;
	}

	public void setDetail(String detail) {
		this.detail = detail;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Instant createdAt) {
		this.createdAt = createdAt;
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
