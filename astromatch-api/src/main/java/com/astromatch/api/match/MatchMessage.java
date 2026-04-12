package com.astromatch.api.match;

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
@Table(name = "match_messages")
public class MatchMessage {

	@Id
	@Column(columnDefinition = "UUID")
	private UUID id;

	@Column(name = "match_id", nullable = false, columnDefinition = "UUID")
	private UUID matchId;

	@Column(name = "sender_id", nullable = false, columnDefinition = "UUID")
	private UUID senderId;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 16)
	private MessageKind kind = MessageKind.TEXT;

	@Column(nullable = false, length = 4000)
	private String body;

	@Column(name = "audio_storage_filename", length = 512)
	private String audioStorageFilename;

	@Column(name = "audio_content_type", length = 128)
	private String audioContentType;

	@Column(name = "audio_duration_ms")
	private Integer audioDurationMs;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public UUID getMatchId() {
		return matchId;
	}

	public void setMatchId(UUID matchId) {
		this.matchId = matchId;
	}

	public UUID getSenderId() {
		return senderId;
	}

	public void setSenderId(UUID senderId) {
		this.senderId = senderId;
	}

	public String getBody() {
		return body;
	}

	public void setBody(String body) {
		this.body = body;
	}

	public MessageKind getKind() {
		return kind;
	}

	public void setKind(MessageKind kind) {
		this.kind = kind != null ? kind : MessageKind.TEXT;
	}

	public String getAudioStorageFilename() {
		return audioStorageFilename;
	}

	public void setAudioStorageFilename(String audioStorageFilename) {
		this.audioStorageFilename = audioStorageFilename;
	}

	public String getAudioContentType() {
		return audioContentType;
	}

	public void setAudioContentType(String audioContentType) {
		this.audioContentType = audioContentType;
	}

	public Integer getAudioDurationMs() {
		return audioDurationMs;
	}

	public void setAudioDurationMs(Integer audioDurationMs) {
		this.audioDurationMs = audioDurationMs;
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
		if (body == null) {
			body = "";
		}
		if (kind == null) {
			kind = MessageKind.TEXT;
		}
	}
}
