package com.astromatch.api.safety;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class UserBlockId implements Serializable {

	@Column(name = "blocker_id", nullable = false, columnDefinition = "UUID")
	private UUID blockerId;

	@Column(name = "blocked_user_id", nullable = false, columnDefinition = "UUID")
	private UUID blockedUserId;

	public UserBlockId() {
	}

	public UserBlockId(UUID blockerId, UUID blockedUserId) {
		this.blockerId = blockerId;
		this.blockedUserId = blockedUserId;
	}

	public UUID getBlockerId() {
		return blockerId;
	}

	public void setBlockerId(UUID blockerId) {
		this.blockerId = blockerId;
	}

	public UUID getBlockedUserId() {
		return blockedUserId;
	}

	public void setBlockedUserId(UUID blockedUserId) {
		this.blockedUserId = blockedUserId;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (o == null || getClass() != o.getClass()) {
			return false;
		}
		UserBlockId that = (UserBlockId) o;
		return Objects.equals(blockerId, that.blockerId) && Objects.equals(blockedUserId, that.blockedUserId);
	}

	@Override
	public int hashCode() {
		return Objects.hash(blockerId, blockedUserId);
	}
}
