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
import com.astromatch.api.identity.Attraction;
import com.astromatch.api.identity.Gender;

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

	@GetMapping("/profile")
	public ResponseEntity<ApiEnvelope<ProfileService.ProfileSnapshotDto>> getProfile(
			@AuthenticationPrincipal UUID userId) {
		return ResponseEntity.ok(ApiEnvelope.success(profileService.getProfileSnapshot(userId)));
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

	@PutMapping("/profile/identity")
	public ResponseEntity<ApiEnvelope<Void>> putIdentity(@AuthenticationPrincipal UUID userId,
			@RequestBody IdentityBody body) {
		profileService.updateIdentity(userId, body.gender(), body.attraction());
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}

	@PutMapping("/profile/birth")
	public ResponseEntity<ApiEnvelope<Void>> putBirth(@AuthenticationPrincipal UUID userId,
			@Valid @RequestBody BirthBody body) {
		profileService.updateBirth(userId,
				new ProfileService.UpdateBirthRequest(body.birthDate(), body.birthTimeUnknown(), body.birthTime(),
						body.birthPlaceLabel(), body.birthPlaceLat(), body.birthPlaceLng(), body.birthTimezone()));
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

	@PutMapping("/profile/firstname")
	public ResponseEntity<ApiEnvelope<Void>> putFirstName(@AuthenticationPrincipal UUID userId,
			@Valid @RequestBody FirstNameBody body) {
		profileService.updateFirstName(userId, body.firstName());
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}

	@PutMapping("/profile/redflags")
	public ResponseEntity<ApiEnvelope<Void>> putRedFlags(@AuthenticationPrincipal UUID userId,
			@RequestBody RedFlagsBody body) {
		profileService.updateRedFlags(userId, body.flags() != null ? body.flags() : List.of());
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}

	@PutMapping("/profile/natalchart")
	public ResponseEntity<ApiEnvelope<Void>> putNatalChart(@AuthenticationPrincipal UUID userId,
			@RequestBody NatalChartBody body) {
		profileService.updateNatalChart(userId, body.chart());
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}

	@GetMapping("/profile/photos")
	public ResponseEntity<ApiEnvelope<List<ProfileService.ProfilePhotoDto>>> listPhotos(
			@AuthenticationPrincipal UUID userId) {
		return ResponseEntity.ok(ApiEnvelope.success(profileService.listPhotos(userId)));
	}

	@GetMapping("/profile/photos/{photoId}")
	public ResponseEntity<byte[]> getMyPhoto(@AuthenticationPrincipal UUID userId,
			@PathVariable UUID photoId) throws Exception {
		byte[] data = profileService.readPhotoFile(userId, photoId);
		String ct = profileService.getPhotoContentType(userId, photoId);
		return ResponseEntity.ok()
				.header("Content-Type", ct)
				.body(data);
	}

	@PostMapping(value = "/profile/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<ApiEnvelope<ProfileService.ProfilePhotoDto>> uploadPhoto(@AuthenticationPrincipal UUID userId,
			@RequestParam("file") MultipartFile file) throws Exception {
		return ResponseEntity.ok(ApiEnvelope.success(profileService.addPhoto(userId, file)));
	}

	@PutMapping("/profile/photos/order")
	public ResponseEntity<ApiEnvelope<Void>> reorderPhotos(@AuthenticationPrincipal UUID userId,
			@RequestBody PhotoOrderBody body) {
		profileService.reorderPhotos(userId, body.orderedIds());
		return ResponseEntity.ok(ApiEnvelope.success(null));
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

	public record IdentityBody(Gender gender, Attraction attraction) {
	}

	public record PushTokenBody(@Size(max = 512) String expoPushToken) {
	}

	public record BirthBody(java.time.LocalDate birthDate, boolean birthTimeUnknown, java.time.LocalTime birthTime,
			String birthPlaceLabel, Double birthPlaceLat, Double birthPlaceLng, String birthTimezone) {
	}

	public record LocationBody(@NotBlank String label, Double lat, Double lng, boolean manual) {
	}

	public record DynamicsBody(List<String> labels) {
	}

	public record BioBody(@Size(max = 2000) String bio) {
	}

	public record RedFlagsBody(List<String> flags) {
	}

	public record FirstNameBody(@NotBlank @Size(max = 128) String firstName) {
	}

	public record NatalChartBody(String chart) {
	}

	public record PhotoOrderBody(List<String> orderedIds) {
	}
}
