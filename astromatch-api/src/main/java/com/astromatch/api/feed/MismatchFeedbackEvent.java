package com.astromatch.api.feed;

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
@Table(name = "mismatch_feedback_events")
public class MismatchFeedbackEvent {

	@Id
	@Column(columnDefinition = "UUID")
	private UUID id;

	@Column(name = "viewer_id", nullable = false, columnDefinition = "UUID")
	private UUID viewerId;

	@Column(name = "target_user_id", nullable = false, columnDefinition = "UUID")
	private UUID targetUserId;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 32)
	private MismatchFocus focus;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	public UUID getId() {
		return id;
	}

	public UUID getViewerId() {
		return viewerId;
	}

	public void setViewerId(UUID viewerId) {
		this.viewerId = viewerId;
	}

	public UUID getTargetUserId() {
		return targetUserId;
	}

	public void setTargetUserId(UUID targetUserId) {
		this.targetUserId = targetUserId;
	}

	public MismatchFocus getFocus() {
		return focus;
	}

	public void setFocus(MismatchFocus focus) {
		this.focus = focus;
	}

	public Instant getCreatedAt() {
		return createdAt;
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
