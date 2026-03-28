package com.astromatch.api.profile;

import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ProfilePhotoMediaController {

	private final ProfileService profileService;

	public ProfilePhotoMediaController(ProfileService profileService) {
		this.profileService = profileService;
	}

	@GetMapping("/api/v1/me/media/photos/{photoId}")
	public ResponseEntity<byte[]> getPhoto(@AuthenticationPrincipal UUID userId, @PathVariable UUID photoId)
			throws Exception {
		byte[] bytes = profileService.readPhotoFile(userId, photoId);
		String ct = profileService.getPhotoContentType(userId, photoId);
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
