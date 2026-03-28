package com.astromatch.api.billing;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "billing_transactions")
public class BillingTransaction {

	@Id
	@Column(columnDefinition = "UUID")
	private UUID id;

	@Column(name = "user_id", nullable = false, columnDefinition = "UUID")
	private UUID userId;

	@Column(nullable = false, length = 16)
	private String platform;

	@Column(name = "product_id", nullable = false, length = 128)
	private String productId;

	@Column(name = "store_transaction_id", nullable = false, length = 256)
	private String storeTransactionId;

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

	public String getPlatform() {
		return platform;
	}

	public void setPlatform(String platform) {
		this.platform = platform;
	}

	public String getProductId() {
		return productId;
	}

	public void setProductId(String productId) {
		this.productId = productId;
	}

	public String getStoreTransactionId() {
		return storeTransactionId;
	}

	public void setStoreTransactionId(String storeTransactionId) {
		this.storeTransactionId = storeTransactionId;
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
