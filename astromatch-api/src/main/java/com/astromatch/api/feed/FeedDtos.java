package com.astromatch.api.feed;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.astromatch.api.match.MatchDtos.MatchCreatedDto;

import jakarta.validation.constraints.NotNull;

public final class FeedDtos {

	private FeedDtos() {
	}

	public record FeedPhotoRef(String id, int sortOrder, String contentType) {
	}

	public record NatalPlanet(String planet, String symbol, String sign) {
	}

	public record FeedCandidateCard(UUID userId, String cosmicContext, String suggestedDynamicKey,
			String suggestedDynamicTitle, String localityLine, String bioPreview, List<FeedPhotoRef> photos,
			List<String> redFlags, String firstName, int age, List<NatalPlanet> natalChart) {
	}

	public record FeedCandidatesEnvelope(List<FeedCandidateCard> candidates) {
	}

	public record FeedQuotaSnapshot(int remainingLikesToday, int remainingSupersToday, int dailyLikeCap,
			int dailySuperLikeCap, int bonusLikeCredits, Instant alignmentBoostUntil, Instant locationPassUntil,
			String locationPassLabel) {
	}

	public record SwipeRequest(@NotNull UUID targetUserId, @NotNull SwipeAction action) {
	}

	public record SwipeResult(int remainingLikesToday, int remainingSupersToday, MatchCreatedDto match,
			int bonusLikeCreditsRemaining) {
	}

	public record MismatchRequest(@NotNull UUID targetUserId, @NotNull MismatchFocus focus) {
	}

	public record PendingLikeDto(UUID userId, String firstName, String firstPhotoId) {
	}
}
