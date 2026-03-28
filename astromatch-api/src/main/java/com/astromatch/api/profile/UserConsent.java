package com.astromatch.api.profile;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_consents")
public class UserConsent {

	@EmbeddedId
	private UserConsentKey id;

	@Column(nullable = false)
	private boolean granted;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected UserConsent() {
	}

	public UserConsent(UserConsentKey id, boolean granted, Instant updatedAt) {
		this.id = id;
		this.granted = granted;
		this.updatedAt = updatedAt;
	}

	public UserConsentKey getId() {
		return id;
	}

	public boolean isGranted() {
		return granted;
	}

	public void setGranted(boolean granted) {
		this.granted = granted;
	}

	public Instant getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(Instant updatedAt) {
		this.updatedAt = updatedAt;
	}
}
