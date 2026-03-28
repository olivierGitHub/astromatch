package com.astromatch.api.feed;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.astromatch.api.common.api.ApiEnvelope;

import jakarta.validation.Valid;

@RestController
public class FeedController {

	private final FeedService feedService;

	public FeedController(FeedService feedService) {
		this.feedService = feedService;
	}

	@GetMapping("/api/v1/feed/candidates")
	public ResponseEntity<ApiEnvelope<FeedDtos.FeedCandidatesEnvelope>> candidates(@AuthenticationPrincipal UUID userId) {
		return ResponseEntity.ok(ApiEnvelope.success(feedService.listCandidates(userId)));
	}

	@GetMapping("/api/v1/feed/quota")
	public ResponseEntity<ApiEnvelope<FeedDtos.FeedQuotaSnapshot>> quota(@AuthenticationPrincipal UUID userId) {
		return ResponseEntity.ok(ApiEnvelope.success(feedService.getQuota(userId)));
	}

	@PostMapping("/api/v1/feed/swipe")
	public ResponseEntity<ApiEnvelope<FeedDtos.SwipeResult>> swipe(@AuthenticationPrincipal UUID userId,
			@Valid @RequestBody FeedDtos.SwipeRequest body) {
		return ResponseEntity.ok(ApiEnvelope.success(feedService.recordSwipe(userId, body)));
	}

	@PostMapping("/api/v1/feed/mismatch")
	public ResponseEntity<ApiEnvelope<Void>> mismatch(@AuthenticationPrincipal UUID userId,
			@Valid @RequestBody FeedDtos.MismatchRequest body) {
		feedService.recordMismatchFeedback(userId, body);
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}
}
