package com.astromatch.api.feed;

import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class FeedProfileMediaController {

	private final FeedService feedService;

	public FeedProfileMediaController(FeedService feedService) {
		this.feedService = feedService;
	}

	@GetMapping("/api/v1/feed/profiles/{ownerUserId}/photos/{photoId}")
	public ResponseEntity<byte[]> feedPhoto(@AuthenticationPrincipal UUID viewerId,
			@PathVariable("ownerUserId") UUID ownerUserId, @PathVariable UUID photoId) throws Exception {
		byte[] bytes = feedService.readFeedPhoto(viewerId, ownerUserId, photoId);
		String ct = feedService.getFeedPhotoContentType(viewerId, ownerUserId, photoId);
		MediaType mt;
		try {
			mt = MediaType.parseMediaType(ct);
		}
		catch (Exception e) {
			mt = MediaType.APPLICATION_OCTET_STREAM;
		}
		return ResponseEntity.ok().header(HttpHeaders.CONTENT_TYPE, mt.toString()).body(bytes);
	}
}
