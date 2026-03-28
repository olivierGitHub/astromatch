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

	public boolean isPresentationComplete(User u, long photoCount) {
		boolean bioOk = u.getBio() != null && !u.getBio().isBlank();
		return photoCount > 0 || bioOk;
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
		u.setBirthTimeUnknown(req.birthTimeUnknown());
		u.setBirthTime(req.birthTime());
		u.setBirthPlaceLabel(req.birthPlaceLabel() != null ? req.birthPlaceLabel().trim() : null);
		u.setBirthPlaceLat(req.birthPlaceLat());
		u.setBirthPlaceLng(req.birthPlaceLng());
		u.setBirthTimezone(req.birthTimezone() != null ? req.birthTimezone().trim() : null);
		if (!req.birthTimeUnknown() && req.birthTime() == null) {
			throw new ProfileRequestException("Provide birth time or mark unknown.");
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
	public void completeOnboarding(UUID userId) {
		User u = userRepository.findById(userId).orElseThrow();
		long photos = profilePhotoRepository.countByUserId(userId);
		if (!isBirthProfileComplete(u) || !isLocationComplete(u) || !isDynamicsComplete(u) || !isPresentationComplete(u, photos)) {
			throw new ProfileRequestException("Complete birth, location, dynamics, and bio or at least one photo first.");
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

	public record MeReadinessDto(boolean onboardingCompleted, boolean birthProfileComplete, boolean locationComplete,
			boolean dynamicsComplete, boolean presentationComplete) {
	}

	public record UpdateBirthRequest(boolean birthTimeUnknown, LocalTime birthTime, String birthPlaceLabel,
			Double birthPlaceLat, Double birthPlaceLng, String birthTimezone) {
	}

	public record UpdateLocationRequest(String label, Double lat, Double lng, boolean manual) {
	}

	public record ProfilePhotoDto(String id, int sortOrder, String contentType) {
	}
}
