package com.astromatch.api.profile;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "profile_photos")
public class ProfilePhoto {

	@Id
	@Column(columnDefinition = "UUID")
	private UUID id;

	@Column(name = "user_id", nullable = false, columnDefinition = "UUID")
	private UUID userId;

	@Column(name = "sort_order", nullable = false)
	private int sortOrder;

	@Column(name = "storage_filename", nullable = false, length = 255)
	private String storageFilename;

	@Column(name = "content_type", nullable = false, length = 64)
	private String contentType;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	public UUID getId() {
		return id;
	}

	public UUID getUserId() {
		return userId;
	}

	public void setUserId(UUID userId) {
		this.userId = userId;
	}

	public int getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(int sortOrder) {
		this.sortOrder = sortOrder;
	}

	public String getStorageFilename() {
		return storageFilename;
	}

	public void setStorageFilename(String storageFilename) {
		this.storageFilename = storageFilename;
	}

	public String getContentType() {
		return contentType;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
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
