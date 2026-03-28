package com.astromatch.api.match;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.astromatch.api.common.api.ApiEnvelope;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/matches")
public class MatchController {

	private final MatchService matchService;
	private final MatchMessagingService matchMessagingService;

	public MatchController(MatchService matchService, MatchMessagingService matchMessagingService) {
		this.matchService = matchService;
		this.matchMessagingService = matchMessagingService;
	}

	@GetMapping
	public ResponseEntity<ApiEnvelope<List<MatchDtos.MatchSummaryDto>>> list(@AuthenticationPrincipal UUID userId) {
		return ResponseEntity.ok(ApiEnvelope.success(matchService.listMatches(userId)));
	}

	@GetMapping("/{matchId}/messages")
	public ResponseEntity<ApiEnvelope<List<MatchDtos.MessageDto>>> messages(@AuthenticationPrincipal UUID userId,
			@PathVariable UUID matchId) {
		return ResponseEntity.ok(ApiEnvelope.success(matchMessagingService.listMessages(userId, matchId)));
	}

	@PostMapping("/{matchId}/messages")
	public ResponseEntity<ApiEnvelope<MatchDtos.MessageDto>> send(@AuthenticationPrincipal UUID userId,
			@PathVariable UUID matchId, @Valid @RequestBody MatchDtos.SendMessageBody body) {
		return ResponseEntity.ok(ApiEnvelope.success(matchMessagingService.sendMessage(userId, matchId, body.body())));
	}
}
