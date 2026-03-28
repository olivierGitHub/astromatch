package com.astromatch.api.profile;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class UserConsentKey implements Serializable {

	@Column(name = "user_id", nullable = false, columnDefinition = "UUID")
	private UUID userId;

	@Column(name = "consent_key", nullable = false, length = 64)
	private String consentKey;

	protected UserConsentKey() {
	}

	public UserConsentKey(UUID userId, String consentKey) {
		this.userId = userId;
		this.consentKey = consentKey;
	}

	public UUID getUserId() {
		return userId;
	}

	public String getConsentKey() {
		return consentKey;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (o == null || getClass() != o.getClass()) {
			return false;
		}
		UserConsentKey that = (UserConsentKey) o;
		return Objects.equals(userId, that.userId) && Objects.equals(consentKey, that.consentKey);
	}

	@Override
	public int hashCode() {
		return Objects.hash(userId, consentKey);
	}
}
