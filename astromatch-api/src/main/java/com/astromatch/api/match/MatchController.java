package com.astromatch.api.match;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.astromatch.api.common.api.ApiEnvelope;
import com.astromatch.api.profile.ProfileService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/matches")
public class MatchController {

	private final MatchService matchService;
	private final MatchMessagingService matchMessagingService;
	private final ProfileService profileService;

	public MatchController(MatchService matchService, MatchMessagingService matchMessagingService,
			ProfileService profileService) {
		this.matchService = matchService;
		this.matchMessagingService = matchMessagingService;
		this.profileService = profileService;
	}

	@GetMapping
	public ResponseEntity<ApiEnvelope<List<MatchDtos.MatchSummaryDto>>> list(@AuthenticationPrincipal UUID userId) {
		return ResponseEntity.ok(ApiEnvelope.success(matchService.listMatches(userId)));
	}

	@GetMapping("/profiles/{otherUserId}/photos/{photoId}")
	public ResponseEntity<byte[]> matchPhoto(@AuthenticationPrincipal UUID userId,
			@PathVariable UUID otherUserId, @PathVariable UUID photoId) throws Exception {
		matchService.assertHaveMatch(userId, otherUserId);
		byte[] bytes = profileService.readPhotoFile(otherUserId, photoId);
		String ct = profileService.getPhotoContentType(otherUserId, photoId);
		MediaType mt;
		try { mt = MediaType.parseMediaType(ct); } catch (Exception e) { mt = MediaType.APPLICATION_OCTET_STREAM; }
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, mt.toString()).body(bytes);
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
