package com.astromatch.api.match;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class MatchDtos {

	private MatchDtos() {
	}

	public record MatchCreatedDto(String matchId, String otherUserId) {
	}

	public record MatchSummaryDto(String matchId, String otherUserId, String otherEmail) {
	}

	public record MessageDto(String id, String senderId, String body, String createdAt) {
	}

	public record SendMessageBody(@NotBlank @Size(max = 4000) String body) {
	}
}
