package com.astromatch.api.match;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity(name = "UserMatch")
@Table(name = "matches", uniqueConstraints = @UniqueConstraint(name = "uq_matches_pair", columnNames = { "user_low",
		"user_high" }))
public class Match {

	@Id
	@Column(columnDefinition = "UUID")
	private UUID id;

	@Column(name = "user_low", nullable = false, columnDefinition = "UUID")
	private UUID userLow;

	@Column(name = "user_high", nullable = false, columnDefinition = "UUID")
	private UUID userHigh;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	public UUID getId() {
		return id;
	}

	public UUID getUserLow() {
		return userLow;
	}

	public void setUserLow(UUID userLow) {
		this.userLow = userLow;
	}

	public UUID getUserHigh() {
		return userHigh;
	}

	public void setUserHigh(UUID userHigh) {
		this.userHigh = userHigh;
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
