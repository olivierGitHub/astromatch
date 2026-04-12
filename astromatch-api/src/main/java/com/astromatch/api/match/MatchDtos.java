package com.astromatch.api.match;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class MatchDtos {

	private MatchDtos() {
	}

	public record MatchCreatedDto(String matchId, String otherUserId,
			String myFirstPhotoId, String otherFirstPhotoId,
			String mySunSign, String otherSunSign) {
	}

	public record MatchSummaryDto(String matchId, String otherUserId, String otherEmail,
			String firstName, String firstPhotoId,
			String lastMessageBody, String lastMessageSenderId) {
	}

	public record MessageDto(String id, String senderId, String body, String createdAt, String kind,
			Integer audioDurationMs) {
	}

	public record SendMessageBody(@NotBlank @Size(max = 4000) String body) {
	}
}
