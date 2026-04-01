package com.astromatch.api.profile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.astromatch.api.config.UploadProperties;
import com.astromatch.api.identity.Attraction;
import com.astromatch.api.identity.Gender;
import com.astromatch.api.identity.User;
import com.astromatch.api.identity.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ProfileService {

	public static final int MAX_PHOTOS = 6;

	private final UserRepository userRepository;
	private final UserConsentRepository userConsentRepository;
	private final ProfilePhotoRepository profilePhotoRepository;
	private final UploadProperties uploadProperties;
	private final ObjectMapper objectMapper;

	public ProfileService(UserRepository userRepository, UserConsentRepository userConsentRepository,
			ProfilePhotoRepository profilePhotoRepository, UploadProperties uploadProperties,
			ObjectMapper objectMapper) {
		this.userRepository = userRepository;
		this.userConsentRepository = userConsentRepository;
		this.profilePhotoRepository = profilePhotoRepository;
		this.uploadProperties = uploadProperties;
		this.objectMapper = objectMapper;
	}

	public MeReadinessDto readiness(User user) {
		long photos = profilePhotoRepository.countByUserId(user.getId());
		return new MeReadinessDto(
				user.isOnboardingCompleted(),
				isBirthProfileComplete(user),
				isLocationComplete(user),
				isDynamicsComplete(user),
				isPresentationComplete(user, photos));
	}

	public boolean isBirthProfileComplete(User u) {
		if (u.getBirthDate() == null) {
			return false;
		}
		if (u.getBirthPlaceLabel() == null || u.getBirthPlaceLabel().isBlank()) {
			return false;
		}
		if (u.getBirthTimezone() == null || u.getBirthTimezone().isBlank()) {
			return false;
		}
		return u.isBirthTimeUnknown() || u.getBirthTime() != null;
	}

	public boolean isLocationComplete(User u) {
		return u.getCurrentLocationLabel() != null && !u.getCurrentLocationLabel().isBlank();
	}

	public boolean isDynamicsComplete(User u) {
		String raw = u.getSoughtDynamics();
		if (raw == null || raw.isBlank()) {
			return false;
		}
		try {
			List<String> list = objectMapper.readValue(raw, new TypeReference<List<String>>() {
			});
			return !list.isEmpty() && list.size() <= 2;
		}
		catch (IOException e) {
			return false;
		}
	}

	public boolean isIdentityComplete(User u) {
		return u.getGender() != null && u.getAttraction() != null;
	}

	public boolean isPresentationComplete(User u, long photoCount) {
		boolean bioOk = u.getBio() != null && !u.getBio().isBlank();
		return photoCount > 0 || bioOk;
	}

	@Transactional(readOnly = true)
	public ProfileSnapshotDto getProfileSnapshot(UUID userId) {
		User u = userRepository.findById(userId).orElseThrow();
		List<String> flags = List.of();
		if (u.getRedFlags() != null && !u.getRedFlags().isBlank()) {
			try {
				flags = objectMapper.readValue(u.getRedFlags(), new TypeReference<List<String>>() {});
			} catch (IOException ignored) {}
		}
		return new ProfileSnapshotDto(u.getBio(), flags,
				u.getBirthDate(), u.getBirthTime(), u.isBirthTimeUnknown(),
				u.getBirthPlaceLabel(), u.getBirthTimezone());
	}

	@Transactional(readOnly = true)
	public List<ProfilePhotoDto> listPhotos(UUID userId) {
		return profilePhotoRepository.findByUserIdOrderBySortOrderAsc(userId).stream()
				.map(p -> new ProfilePhotoDto(p.getId().toString(), p.getSortOrder(), p.getContentType()))
				.toList();
	}

	@Transactional
	public void reorderPhotos(UUID userId, List<String> orderedIds) {
		if (orderedIds == null) {
			return;
		}
		List<ProfilePhoto> existing = profilePhotoRepository.findByUserIdOrderBySortOrderAsc(userId);
		for (int i = 0; i < orderedIds.size(); i++) {
			final int order = i;
			UUID id = UUID.fromString(orderedIds.get(i));
			existing.stream()
					.filter(p -> p.getId().equals(id))
					.findFirst()
					.ifPresent(p -> {
						p.setSortOrder(order);
						profilePhotoRepository.save(p);
					});
		}
	}

	@Transactional(readOnly = true)
	public Map<String, Boolean> getConsents(UUID userId) {
		Map<String, Boolean> out = new LinkedHashMap<>();
		out.put("notifications", false);
		out.put("analytics", false);
		out.put("privacy_ack", false);
		for (UserConsent c : userConsentRepository.findById_UserId(userId)) {
			out.put(c.getId().getConsentKey(), c.isGranted());
		}
		return out;
	}

	@Transactional
	public void putConsents(UUID userId, Map<String, Boolean> values) {
		Instant now = Instant.now();
		for (Map.Entry<String, Boolean> e : values.entrySet()) {
			String key = e.getKey();
			if (!key.equals("notifications") && !key.equals("analytics") && !key.equals("privacy_ack")) {
				throw new ProfileRequestException("Unknown consent key: " + key);
			}
			UserConsentKey cid = new UserConsentKey(userId, key);
			UserConsent row = userConsentRepository.findById(cid).orElseGet(() -> new UserConsent(cid, false, now));
			row.setGranted(Boolean.TRUE.equals(e.getValue()));
			row.setUpdatedAt(now);
			userConsentRepository.save(row);
		}
	}

	@Transactional
	public void updateBirth(UUID userId, UpdateBirthRequest req) {
		User u = userRepository.findById(userId).orElseThrow();
		if (req.birthPlaceLabel() == null || req.birthPlaceLabel().isBlank()) {
			throw new ProfileRequestException("Birth place is required.");
		}
		if (req.birthTimezone() == null || req.birthTimezone().isBlank()) {
			throw new ProfileRequestException("Birth timezone is required.");
		}
		if (req.birthDate() != null) {
			u.setBirthDate(req.birthDate());
		}
		u.setBirthTimeUnknown(req.birthTimeUnknown());
		u.setBirthTime(req.birthTime());
		u.setBirthPlaceLabel(req.birthPlaceLabel() != null ? req.birthPlaceLabel().trim() : null);
		u.setBirthPlaceLat(req.birthPlaceLat());
		u.setBirthPlaceLng(req.birthPlaceLng());
		u.setBirthTimezone(req.birthTimezone() != null ? req.birthTimezone().trim() : null);
		if (!req.birthTimeUnknown() && req.birthTime() == null) {
			throw new ProfileRequestException("Provide birth time or mark unknown.");
		}
		// Regenerate natal chart if birth date is available
		if (u.getBirthDate() != null) {
			try {
				List<NatalChartCalculator.NatalPlanetData> chart = NatalChartCalculator.compute(u.getBirthDate());
				// Serialize as [{"planet":"...","symbol":"...","sign":"..."}]
				List<java.util.Map<String, String>> simplified = chart.stream()
						.map(p -> java.util.Map.of("planet", p.planet(), "symbol", p.symbol(), "sign", p.sign()))
						.toList();
				u.setNatalChart(objectMapper.writeValueAsString(simplified));
			} catch (IOException e) {
				// Non-blocking — birth data is saved, chart regeneration failed silently
			}
		}
		userRepository.save(u);
	}

	@Transactional
	public void updateLocation(UUID userId, UpdateLocationRequest req) {
		User u = userRepository.findById(userId).orElseThrow();
		if (req.label() == null || req.label().isBlank()) {
			throw new ProfileRequestException("Location label is required.");
		}
		u.setCurrentLocationLabel(req.label().trim());
		u.setCurrentLocationLat(req.lat());
		u.setCurrentLocationLng(req.lng());
		u.setCurrentLocationManual(req.manual());
		userRepository.save(u);
	}

	@Transactional
	public void updateDynamics(UUID userId, List<String> labels) {
		RelationshipDynamicsCatalog.validateLabels(labels);
		User u = userRepository.findById(userId).orElseThrow();
		try {
			if (labels == null || labels.isEmpty()) {
				u.setSoughtDynamics(null);
			}
			else {
				u.setSoughtDynamics(objectMapper.writeValueAsString(labels));
			}
		}
		catch (IOException e) {
			throw new ProfileRequestException("Could not save dynamics");
		}
		userRepository.save(u);
	}

	@Transactional
	public void updateBio(UUID userId, String bio) {
		User u = userRepository.findById(userId).orElseThrow();
		if (bio != null && bio.length() > 2000) {
			throw new ProfileRequestException("Bio must be at most 2000 characters.");
		}
		u.setBio(bio != null ? bio.trim() : null);
		userRepository.save(u);
	}

	@Transactional
	public void updateNatalChart(UUID userId, String natalChartJson) {
		User u = userRepository.findById(userId).orElseThrow();
		u.setNatalChart(natalChartJson);
		userRepository.save(u);
	}

	@Transactional
	public void updateFirstName(UUID userId, String firstName) {
		if (firstName == null || firstName.isBlank()) {
			throw new ProfileRequestException("First name is required.");
		}
		if (firstName.length() > 128) {
			throw new ProfileRequestException("First name must be at most 128 characters.");
		}
		User u = userRepository.findById(userId).orElseThrow();
		u.setFirstName(firstName.trim());
		userRepository.save(u);
	}

	@Transactional
	public void updateRedFlags(UUID userId, List<String> flags) {
		if (flags == null || flags.size() > 3) {
			throw new ProfileRequestException("Red flags must be a list of at most 3 items.");
		}
		User u = userRepository.findById(userId).orElseThrow();
		try {
			u.setRedFlags(flags.isEmpty() ? null : objectMapper.writeValueAsString(flags));
		} catch (IOException e) {
			throw new ProfileRequestException("Could not save red flags");
		}
		userRepository.save(u);
	}

	@Transactional
	public ProfilePhotoDto addPhoto(UUID userId, MultipartFile file) throws IOException {
		if (file == null || file.isEmpty()) {
			throw new ProfileRequestException("Empty file");
		}
		if (profilePhotoRepository.countByUserId(userId) >= MAX_PHOTOS) {
			throw new ProfileRequestException("Maximum " + MAX_PHOTOS + " photos");
		}
		String ct = file.getContentType();
		if (ct == null || (!ct.startsWith("image/jpeg") && !ct.startsWith("image/png") && !ct.startsWith("image/webp"))) {
			throw new ProfileRequestException("Only jpeg, png, or webp images are allowed");
		}
		if (file.getSize() > uploadProperties.getMaxPhotoBytes()) {
			throw new ProfileRequestException("File too large");
		}
		Path dir = Path.of(uploadProperties.getDir());
		Files.createDirectories(dir);
		String filename = UUID.randomUUID() + storageSuffix(ct);
		Path target = dir.resolve(filename);
		Files.write(target, file.getBytes());

		List<ProfilePhoto> existing = profilePhotoRepository.findByUserIdOrderBySortOrderAsc(userId);
		int order = existing.isEmpty() ? 0 : existing.get(existing.size() - 1).getSortOrder() + 1;
		ProfilePhoto p = new ProfilePhoto();
		p.setUserId(userId);
		p.setSortOrder(order);
		p.setStorageFilename(filename);
		p.setContentType(ct);
		p = profilePhotoRepository.save(p);
		return new ProfilePhotoDto(p.getId().toString(), p.getSortOrder(), p.getContentType());
	}

	private static String storageSuffix(String contentType) {
		if (contentType.contains("png")) {
			return ".png";
		}
		if (contentType.contains("webp")) {
			return ".webp";
		}
		return ".jpg";
	}

	@Transactional
	public void deletePhoto(UUID userId, UUID photoId) throws IOException {
		ProfilePhoto p = profilePhotoRepository.findByIdAndUserId(photoId, userId)
				.orElseThrow(() -> new ProfileRequestException("Photo not found"));
		Path path = Path.of(uploadProperties.getDir()).resolve(p.getStorageFilename());
		profilePhotoRepository.delete(p);
		Files.deleteIfExists(path);
	}

	@Transactional
	public void updateIdentity(UUID userId, Gender gender, Attraction attraction) {
		if (gender == null) {
			throw new ProfileRequestException("Gender is required.");
		}
		if (attraction == null) {
			throw new ProfileRequestException("Attraction is required.");
		}
		User u = userRepository.findById(userId).orElseThrow();
		u.setGender(gender);
		u.setAttraction(attraction);
		userRepository.save(u);
	}

	@Transactional
	public void completeOnboarding(UUID userId) {
		User u = userRepository.findById(userId).orElseThrow();
		long photos = profilePhotoRepository.countByUserId(userId);
		if (u.getFirstName() == null || u.getFirstName().isBlank()) {
			throw new ProfileRequestException("First name is required.");
		}
		if (!isIdentityComplete(u) || !isBirthProfileComplete(u) || !isLocationComplete(u) || !isDynamicsComplete(u) || !isPresentationComplete(u, photos)) {
			throw new ProfileRequestException("Complete identity, birth, location, dynamics, and bio or at least one photo first.");
		}
		Map<String, Boolean> consents = getConsents(userId);
		if (!Boolean.TRUE.equals(consents.get("privacy_ack"))) {
			throw new ProfileRequestException("Acknowledge the privacy notice first.");
		}
		u.setOnboardingCompleted(true);
		userRepository.save(u);
	}

	public byte[] readPhotoFile(UUID userId, UUID photoId) throws IOException {
		ProfilePhoto p = profilePhotoRepository.findByIdAndUserId(photoId, userId)
				.orElseThrow(() -> new ProfileRequestException("Photo not found"));
		return Files.readAllBytes(Path.of(uploadProperties.getDir()).resolve(p.getStorageFilename()));
	}

	public String getPhotoContentType(UUID userId, UUID photoId) {
		return profilePhotoRepository.findByIdAndUserId(photoId, userId).map(ProfilePhoto::getContentType)
				.orElse("application/octet-stream");
	}

	@Transactional
	public void updateExpoPushToken(UUID userId, String token) {
		User u = userRepository.findById(userId).orElseThrow();
		u.setExpoPushToken(token != null && !token.isBlank() ? token.trim() : null);
		userRepository.save(u);
	}

	public record ProfileSnapshotDto(String bio, List<String> redFlags,
			java.time.LocalDate birthDate, java.time.LocalTime birthTime, boolean birthTimeUnknown,
			String birthPlaceLabel, String birthTimezone) {
	}

	public record MeReadinessDto(boolean onboardingCompleted, boolean birthProfileComplete, boolean locationComplete,
			boolean dynamicsComplete, boolean presentationComplete) {
	}

	public record UpdateBirthRequest(java.time.LocalDate birthDate, boolean birthTimeUnknown, LocalTime birthTime,
			String birthPlaceLabel, Double birthPlaceLat, Double birthPlaceLng, String birthTimezone) {
	}

	public record UpdateLocationRequest(String label, Double lat, Double lng, boolean manual) {
	}

	public record ProfilePhotoDto(String id, int sortOrder, String contentType) {
	}
}
