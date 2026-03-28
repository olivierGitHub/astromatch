package com.astromatch.api.feed;

import java.io.IOException;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.astromatch.api.config.FeedProperties;
import com.astromatch.api.config.SlidingWindowRateLimiter;
import com.astromatch.api.identity.RateLimitExceededException;
import com.astromatch.api.identity.User;
import com.astromatch.api.identity.UserRepository;
import com.astromatch.api.match.MatchDtos.MatchCreatedDto;
import com.astromatch.api.match.MatchService;
import com.astromatch.api.profile.ProfilePhoto;
import com.astromatch.api.profile.ProfilePhotoRepository;
import com.astromatch.api.profile.ProfileRequestException;
import com.astromatch.api.profile.RelationshipDynamicsCatalog;
import com.astromatch.api.safety.UserBlockRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class FeedService {

	private static final Map<String, String> DYNAMIC_TITLES = new LinkedHashMap<>();

	static {
		DYNAMIC_TITLES.put("deep_connection", "Deep connection");
		DYNAMIC_TITLES.put("playful_exploration", "Playful exploration");
		DYNAMIC_TITLES.put("slow_burn", "Slow burn");
		DYNAMIC_TITLES.put("adventure_together", "Adventure together");
		DYNAMIC_TITLES.put("spiritual_alignment", "Spiritual alignment");
		DYNAMIC_TITLES.put("friendship_first", "Friendship first");
		DYNAMIC_TITLES.put("passion_forward", "Passion forward");
		DYNAMIC_TITLES.put("co_creation", "Co-creation");
	}

	private static final long SWIPE_WINDOW_MS = 60_000L;

	private final UserRepository userRepository;
	private final ProfilePhotoRepository profilePhotoRepository;
	private final SwipeEventRepository swipeEventRepository;
	private final MismatchFeedbackRepository mismatchFeedbackRepository;
	private final FeedProperties feedProperties;
	private final SlidingWindowRateLimiter limiter;
	private final ObjectMapper objectMapper;
	private final com.astromatch.api.profile.ProfileService profileService;
	private final MatchService matchService;
	private final UserBlockRepository userBlockRepository;

	public FeedService(UserRepository userRepository, ProfilePhotoRepository profilePhotoRepository,
			SwipeEventRepository swipeEventRepository, MismatchFeedbackRepository mismatchFeedbackRepository,
			FeedProperties feedProperties,
			SlidingWindowRateLimiter limiter, ObjectMapper objectMapper,
			com.astromatch.api.profile.ProfileService profileService, MatchService matchService,
			UserBlockRepository userBlockRepository) {
		this.userRepository = userRepository;
		this.profilePhotoRepository = profilePhotoRepository;
		this.swipeEventRepository = swipeEventRepository;
		this.mismatchFeedbackRepository = mismatchFeedbackRepository;
		this.feedProperties = feedProperties;
		this.limiter = limiter;
		this.objectMapper = objectMapper;
		this.profileService = profileService;
		this.matchService = matchService;
		this.userBlockRepository = userBlockRepository;
	}

	@Transactional(readOnly = true)
	public FeedDtos.FeedCandidatesEnvelope listCandidates(UUID viewerId) {
		User viewer = userRepository.findById(viewerId).orElseThrow();
		List<User> raw = userRepository.findByOnboardingCompletedTrueAndIdNot(viewerId);
		List<User> open = new ArrayList<>();
		for (User u : raw) {
			if (userBlockRepository.existsEitherDirection(viewerId, u.getId())) {
				continue;
			}
			if (!swipeEventRepository.existsByViewerIdAndTargetUserId(viewerId, u.getId())) {
				open.add(u);
			}
		}
		open.sort(Comparator
				.comparing((User u) -> mismatchFeedbackRepository.existsByViewerIdAndTargetUserId(viewerId, u.getId()))
				.thenComparingLong((User u) -> mixWithBoost(viewerId, u.getId(), viewer))
				.thenComparing(User::getId));

		List<FeedDtos.FeedCandidateCard> cards = new ArrayList<>();
		for (User u : open) {
			cards.add(toCard(viewerId, u));
		}
		return new FeedDtos.FeedCandidatesEnvelope(cards);
	}

	@Transactional(readOnly = true)
	public FeedDtos.FeedQuotaSnapshot getQuota(UUID viewerId) {
		Instant dayStart = startOfUtcDay(Instant.now());
		long likes = swipeEventRepository.countByViewerIdAndActionAndCreatedAtGreaterThanEqual(viewerId,
				SwipeAction.LIKE, dayStart);
		long supers = swipeEventRepository.countByViewerIdAndActionAndCreatedAtGreaterThanEqual(viewerId,
				SwipeAction.SUPER_LIKE, dayStart);
		User u = userRepository.findById(viewerId).orElseThrow();
		int remLikes = Math.max(0, feedProperties.getDailyLikeCap() - (int) likes);
		int remSupers = Math.max(0, feedProperties.getDailySuperLikeCap() - (int) supers);
		return new FeedDtos.FeedQuotaSnapshot(remLikes, remSupers, feedProperties.getDailyLikeCap(),
				feedProperties.getDailySuperLikeCap(), u.getBonusSwipeBalance(), u.getAlignmentBoostUntil(),
				u.getLocationPassUntil(), u.getLocationPassLabel());
	}

	@Transactional
	public FeedDtos.SwipeResult recordSwipe(UUID viewerId, FeedDtos.SwipeRequest req) {
		String burstKey = "swipe:" + viewerId;
		if (!limiter.allow(burstKey, feedProperties.getSwipeBurstPerMinutePerUser(), SWIPE_WINDOW_MS)) {
			throw new RateLimitExceededException();
		}
		User target = userRepository.findById(req.targetUserId())
				.orElseThrow(() -> new InvalidSwipeTargetException("Profile not found"));
		if (!target.isOnboardingCompleted()) {
			throw new InvalidSwipeTargetException("Profile is not available");
		}
		if (target.getId().equals(viewerId)) {
			throw new InvalidSwipeTargetException("Invalid target");
		}
		if (userBlockRepository.existsEitherDirection(viewerId, target.getId())) {
			throw new InvalidSwipeTargetException("Interaction not allowed");
		}
		if (swipeEventRepository.existsByViewerIdAndTargetUserId(viewerId, target.getId())) {
			throw new InvalidSwipeTargetException("You already swiped this profile");
		}

		Instant dayStart = startOfUtcDay(Instant.now());
		if (req.action() == SwipeAction.LIKE) {
			long likes = swipeEventRepository.countByViewerIdAndActionAndCreatedAtGreaterThanEqual(viewerId,
					SwipeAction.LIKE, dayStart);
			if (likes >= feedProperties.getDailyLikeCap()) {
				User viewer = userRepository.findById(viewerId).orElseThrow();
				if (viewer.getBonusSwipeBalance() <= 0) {
					throw new FeedQuotaExceededException(
							"Daily like limit reached. Try again tomorrow or upgrade when available.");
				}
				viewer.setBonusSwipeBalance(viewer.getBonusSwipeBalance() - 1);
				userRepository.save(viewer);
			}
		}
		if (req.action() == SwipeAction.SUPER_LIKE) {
			long supers = swipeEventRepository.countByViewerIdAndActionAndCreatedAtGreaterThanEqual(viewerId,
					SwipeAction.SUPER_LIKE, dayStart);
			if (supers >= feedProperties.getDailySuperLikeCap()) {
				throw new FeedQuotaExceededException("Daily super-like limit reached.");
			}
		}

		SwipeEvent ev = new SwipeEvent();
		ev.setViewerId(viewerId);
		ev.setTargetUserId(target.getId());
		ev.setAction(req.action());
		swipeEventRepository.save(ev);

		MatchCreatedDto matchCreated = null;
		if (req.action() == SwipeAction.LIKE || req.action() == SwipeAction.SUPER_LIKE) {
			matchCreated = matchService.tryCreateMatchAfterSwipe(viewerId, target.getId());
		}

		long likesAfter = swipeEventRepository.countByViewerIdAndActionAndCreatedAtGreaterThanEqual(viewerId,
				SwipeAction.LIKE, dayStart);
		long supersAfter = swipeEventRepository.countByViewerIdAndActionAndCreatedAtGreaterThanEqual(viewerId,
				SwipeAction.SUPER_LIKE, dayStart);
		int remLikes = Math.max(0, feedProperties.getDailyLikeCap() - (int) likesAfter);
		int remSupers = Math.max(0, feedProperties.getDailySuperLikeCap() - (int) supersAfter);
		User viewerAfter = userRepository.findById(viewerId).orElseThrow();
		return new FeedDtos.SwipeResult(remLikes, remSupers, matchCreated, viewerAfter.getBonusSwipeBalance());
	}

	@Transactional
	public void recordMismatchFeedback(UUID viewerId, FeedDtos.MismatchRequest req) {
		String burstKey = "mismatch:" + viewerId;
		if (!limiter.allow(burstKey, feedProperties.getSwipeBurstPerMinutePerUser(), SWIPE_WINDOW_MS)) {
			throw new RateLimitExceededException();
		}
		User target = userRepository.findById(req.targetUserId())
				.orElseThrow(() -> new InvalidSwipeTargetException("Profile not found"));
		if (!target.isOnboardingCompleted()) {
			throw new InvalidSwipeTargetException("Profile is not available");
		}
		if (target.getId().equals(viewerId)) {
			throw new InvalidSwipeTargetException("Invalid target");
		}
		if (userBlockRepository.existsEitherDirection(viewerId, target.getId())) {
			throw new InvalidSwipeTargetException("Interaction not allowed");
		}
		if (swipeEventRepository.existsByViewerIdAndTargetUserId(viewerId, target.getId())) {
			throw new InvalidSwipeTargetException("You already swiped this profile");
		}

		MismatchFeedbackEvent ev = new MismatchFeedbackEvent();
		ev.setViewerId(viewerId);
		ev.setTargetUserId(target.getId());
		ev.setFocus(req.focus());
		mismatchFeedbackRepository.save(ev);
	}

	@Transactional(readOnly = true)
	public byte[] readFeedPhoto(UUID viewerId, UUID ownerUserId, UUID photoId) throws IOException {
		assertCanViewFeedProfile(viewerId, ownerUserId, photoId);
		return profileService.readPhotoFile(ownerUserId, photoId);
	}

	@Transactional(readOnly = true)
	public String getFeedPhotoContentType(UUID viewerId, UUID ownerUserId, UUID photoId) {
		assertCanViewFeedProfile(viewerId, ownerUserId, photoId);
		return profileService.getPhotoContentType(ownerUserId, photoId);
	}

	private void assertCanViewFeedProfile(UUID viewerId, UUID ownerUserId, UUID photoId) {
		User owner = userRepository.findById(ownerUserId).orElseThrow(() -> new ProfileRequestException("Not found"));
		if (!owner.isOnboardingCompleted()) {
			throw new ProfileRequestException("Not found");
		}
		profilePhotoRepository.findByIdAndUserId(photoId, ownerUserId)
				.orElseThrow(() -> new ProfileRequestException("Not found"));
		if (ownerUserId.equals(viewerId)) {
			return;
		}
		if (userBlockRepository.existsEitherDirection(viewerId, ownerUserId)) {
			throw new ProfileRequestException("Not found");
		}
		if (swipeEventRepository.existsByViewerIdAndTargetUserId(viewerId, ownerUserId)) {
			throw new ProfileRequestException("Not found");
		}
	}

	private FeedDtos.FeedCandidateCard toCard(UUID viewerId, User u) {
		String cosmic = CosmicCopy.lineFor(viewerId, u.getId());
		String dynKey = firstDynamicKey(u);
		String dynTitle = DYNAMIC_TITLES.getOrDefault(dynKey, humanize(dynKey));
		String locality = u.getCurrentLocationLabel() != null && !u.getCurrentLocationLabel().isBlank()
				? u.getCurrentLocationLabel().trim()
				: "Somewhere new";
		String bio = u.getBio();
		String bioPreview = bio == null || bio.isBlank() ? ""
				: (bio.length() > 120 ? bio.substring(0, 117).trim() + "…" : bio);

		List<ProfilePhoto> photos = profilePhotoRepository.findByUserIdOrderBySortOrderAsc(u.getId());
		List<FeedDtos.FeedPhotoRef> refs = new ArrayList<>();
		for (ProfilePhoto p : photos) {
			refs.add(new FeedDtos.FeedPhotoRef(p.getId().toString(), p.getSortOrder(), p.getContentType()));
		}
		return new FeedDtos.FeedCandidateCard(u.getId(), cosmic, dynKey, dynTitle, locality, bioPreview, refs);
	}

	private String firstDynamicKey(User u) {
		String raw = u.getSoughtDynamics();
		if (raw == null || raw.isBlank()) {
			return "deep_connection";
		}
		try {
			List<String> labels = objectMapper.readValue(raw, new TypeReference<List<String>>() {
			});
			if (labels != null && !labels.isEmpty() && RelationshipDynamicsCatalog.LABEL_SET.contains(labels.get(0))) {
				return labels.get(0);
			}
		}
		catch (Exception ignored) {
			// fall through
		}
		return "deep_connection";
	}

	private static String humanize(String key) {
		return key.replace('_', ' ');
	}

	private static long mix(UUID viewer, UUID candidate) {
		return viewer.getMostSignificantBits() ^ candidate.getMostSignificantBits()
				^ viewer.getLeastSignificantBits() ^ candidate.getLeastSignificantBits();
	}

	/**
	 * Opaque reorder when alignment boost is active (no user-visible ranking rules).
	 */
	private static long mixWithBoost(UUID viewerId, UUID candidateId, User viewer) {
		long m = mix(viewerId, candidateId);
		if (viewer.getAlignmentBoostUntil() != null && viewer.getAlignmentBoostUntil().isAfter(Instant.now())) {
			return Long.rotateLeft(m, 19) ^ 0x9E3779B97F4A7C15L;
		}
		return m;
	}

	private static Instant startOfUtcDay(Instant now) {
		return now.atZone(ZoneOffset.UTC).toLocalDate().atStartOfDay(ZoneOffset.UTC).toInstant();
	}
}
