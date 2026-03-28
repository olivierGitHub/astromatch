package com.astromatch.api.safety;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_blocks")
public class UserBlock {

	@EmbeddedId
	private UserBlockId id;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	public UserBlockId getId() {
		return id;
	}

	public void setId(UserBlockId id) {
		this.id = id;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Instant createdAt) {
		this.createdAt = createdAt;
	}

	@PrePersist
	void prePersist() {
		if (createdAt == null) {
			createdAt = Instant.now();
		}
	}
}
