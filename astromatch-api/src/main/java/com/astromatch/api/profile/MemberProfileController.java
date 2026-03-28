package com.astromatch.api.profile;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.astromatch.api.common.api.ApiEnvelope;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/v1/me")
public class MemberProfileController {

	private final ProfileService profileService;

	public MemberProfileController(ProfileService profileService) {
		this.profileService = profileService;
	}

	@GetMapping("/consents")
	public ResponseEntity<ApiEnvelope<Map<String, Boolean>>> getConsents(@AuthenticationPrincipal UUID userId) {
		return ResponseEntity.ok(ApiEnvelope.success(profileService.getConsents(userId)));
	}

	@PutMapping("/consents")
	public ResponseEntity<ApiEnvelope<Map<String, Boolean>>> putConsents(@AuthenticationPrincipal UUID userId,
			@RequestBody Map<String, Boolean> body) {
		profileService.putConsents(userId, body);
		return ResponseEntity.ok(ApiEnvelope.success(profileService.getConsents(userId)));
	}

	@PutMapping("/profile/birth")
	public ResponseEntity<ApiEnvelope<Void>> putBirth(@AuthenticationPrincipal UUID userId,
			@Valid @RequestBody BirthBody body) {
		profileService.updateBirth(userId,
				new ProfileService.UpdateBirthRequest(body.birthTimeUnknown(), body.birthTime(), body.birthPlaceLabel(),
						body.birthPlaceLat(), body.birthPlaceLng(), body.birthTimezone()));
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}

	@PutMapping("/profile/location")
	public ResponseEntity<ApiEnvelope<Void>> putLocation(@AuthenticationPrincipal UUID userId,
			@Valid @RequestBody LocationBody body) {
		profileService.updateLocation(userId,
				new ProfileService.UpdateLocationRequest(body.label(), body.lat(), body.lng(), body.manual()));
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}

	@PutMapping("/profile/dynamics")
	public ResponseEntity<ApiEnvelope<Void>> putDynamics(@AuthenticationPrincipal UUID userId,
			@RequestBody DynamicsBody body) {
		profileService.updateDynamics(userId, body.labels() != null ? body.labels() : List.of());
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}

	@PutMapping("/profile/bio")
	public ResponseEntity<ApiEnvelope<Void>> putBio(@AuthenticationPrincipal UUID userId, @Valid @RequestBody BioBody body) {
		profileService.updateBio(userId, body.bio());
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}

	@PostMapping(value = "/profile/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<ApiEnvelope<ProfileService.ProfilePhotoDto>> uploadPhoto(@AuthenticationPrincipal UUID userId,
			@RequestParam("file") MultipartFile file) throws Exception {
		return ResponseEntity.ok(ApiEnvelope.success(profileService.addPhoto(userId, file)));
	}

	@DeleteMapping("/profile/photos/{photoId}")
	public ResponseEntity<ApiEnvelope<Void>> deletePhoto(@AuthenticationPrincipal UUID userId,
			@PathVariable UUID photoId) throws Exception {
		profileService.deletePhoto(userId, photoId);
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}

	@PostMapping("/onboarding/complete")
	public ResponseEntity<ApiEnvelope<Void>> completeOnboarding(@AuthenticationPrincipal UUID userId) {
		profileService.completeOnboarding(userId);
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}

	@PutMapping("/device/push-token")
	public ResponseEntity<ApiEnvelope<Void>> putExpoPushToken(@AuthenticationPrincipal UUID userId,
			@Valid @RequestBody PushTokenBody body) {
		profileService.updateExpoPushToken(userId, body.expoPushToken());
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}

	public record PushTokenBody(@Size(max = 512) String expoPushToken) {
	}

	public record BirthBody(boolean birthTimeUnknown, java.time.LocalTime birthTime, String birthPlaceLabel,
			Double birthPlaceLat, Double birthPlaceLng, String birthTimezone) {
	}

	public record LocationBody(@NotBlank String label, Double lat, Double lng, boolean manual) {
	}

	public record DynamicsBody(List<String> labels) {
	}

	public record BioBody(@Size(max = 2000) String bio) {
	}
}
