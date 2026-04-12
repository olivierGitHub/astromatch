package com.astromatch.api.match;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.astromatch.api.feed.SwipeAction;
import com.astromatch.api.feed.SwipeEventRepository;
import com.astromatch.api.identity.User;
import com.astromatch.api.identity.UserRepository;
import com.astromatch.api.profile.NatalChartCalculator;
import com.astromatch.api.profile.ProfilePhoto;
import com.astromatch.api.profile.ProfilePhotoRepository;
import com.astromatch.api.safety.UserBlockRepository;

@Service
public class MatchService {

	private final MatchRepository matchRepository;
	private final SwipeEventRepository swipeEventRepository;
	private final UserRepository userRepository;
	private final UserBlockRepository userBlockRepository;
	private final PushNotificationService pushNotificationService;
	private final ProfilePhotoRepository profilePhotoRepository;
	private final MatchMessageRepository matchMessageRepository;

	public MatchService(MatchRepository matchRepository, SwipeEventRepository swipeEventRepository,
			UserRepository userRepository, UserBlockRepository userBlockRepository,
			PushNotificationService pushNotificationService, ProfilePhotoRepository profilePhotoRepository,
			MatchMessageRepository matchMessageRepository) {
		this.matchRepository = matchRepository;
		this.swipeEventRepository = swipeEventRepository;
		this.userRepository = userRepository;
		this.userBlockRepository = userBlockRepository;
		this.pushNotificationService = pushNotificationService;
		this.profilePhotoRepository = profilePhotoRepository;
		this.matchMessageRepository = matchMessageRepository;
	}

	/**
	 * After a LIKE/SUPER_LIKE from swiper toward target, create a match if the target had already
	 * liked the swiper. Returns payload only when a new match row is created.
	 */
	@Transactional
	public MatchDtos.MatchCreatedDto tryCreateMatchAfterSwipe(UUID swiperId, UUID targetId) {
		boolean reciprocal = swipeEventRepository.existsByViewerIdAndTargetUserIdAndActionIn(targetId, swiperId,
				List.of(SwipeAction.LIKE, SwipeAction.SUPER_LIKE));
		if (!reciprocal) {
			return null;
		}
		UUID low = swiperId.compareTo(targetId) < 0 ? swiperId : targetId;
		UUID high = swiperId.compareTo(targetId) < 0 ? targetId : swiperId;
		if (matchRepository.findByUserLowAndUserHigh(low, high).isPresent()) {
			return null;
		}
		Match m = new Match();
		m.setUserLow(low);
		m.setUserHigh(high);
		matchRepository.save(m);
		pushNotificationService.notifyNewMatch(m.getId(), swiperId, targetId);

		User swiper = userRepository.findById(swiperId).orElse(null);
		User target = userRepository.findById(targetId).orElse(null);

		List<ProfilePhoto> swiperPhotos = profilePhotoRepository.findByUserIdOrderBySortOrderAsc(swiperId);
		List<ProfilePhoto> targetPhotos = profilePhotoRepository.findByUserIdOrderBySortOrderAsc(targetId);
		String myPhotoId = swiperPhotos.isEmpty() ? null : swiperPhotos.get(0).getId().toString();
		String otherPhotoId = targetPhotos.isEmpty() ? null : targetPhotos.get(0).getId().toString();

		String mySunSign = sunSignSymbol(swiper);
		String otherSunSign = sunSignSymbol(target);

		return new MatchDtos.MatchCreatedDto(m.getId().toString(), targetId.toString(),
				myPhotoId, otherPhotoId, mySunSign, otherSunSign);
	}

	@Transactional(readOnly = true)
	public List<MatchDtos.MatchSummaryDto> listMatches(UUID userId) {
		List<Match> rows = matchRepository.findAllForUser(userId);
		record MatchSummarySort(MatchDtos.MatchSummaryDto dto, Instant sortAt) {
		}
		List<MatchSummarySort> bucket = new ArrayList<>();
		for (Match m : rows) {
			UUID other = m.getUserLow().equals(userId) ? m.getUserHigh() : m.getUserLow();
			if (userBlockRepository.existsEitherDirection(userId, other)) {
				continue;
			}
			User u = userRepository.findById(other).orElse(null);
			String email = u != null ? u.getEmail() : "unknown@invalid";
			String firstName = u != null && u.getFirstName() != null ? u.getFirstName() : "";
			List<ProfilePhoto> photos = profilePhotoRepository.findByUserIdOrderBySortOrderAsc(other);
			String firstPhotoId = photos.isEmpty() ? null : photos.get(0).getId().toString();
			MatchMessage last = matchMessageRepository.findFirstByMatchIdOrderByCreatedAtDesc(m.getId()).orElse(null);
			String lastBody = null;
			if (last != null) {
				if (last.getKind() == MessageKind.AUDIO) {
					lastBody = "Message vocal";
				}
				else if (last.getKind() == MessageKind.IMAGE) {
					lastBody = "Photo";
				}
				else {
					lastBody = last.getBody();
				}
			}
			String lastSenderId = last != null ? last.getSenderId().toString() : null;
			Instant sortAt = last != null ? last.getCreatedAt() : m.getCreatedAt();
			bucket.add(new MatchSummarySort(
					new MatchDtos.MatchSummaryDto(m.getId().toString(), other.toString(), email, firstName, firstPhotoId,
							lastBody, lastSenderId),
					sortAt));
		}
		bucket.sort(Comparator.comparing(MatchSummarySort::sortAt).reversed().thenComparing(s -> s.dto().matchId()));
		return bucket.stream().map(MatchSummarySort::dto).toList();
	}

	private String sunSignSymbol(User user) {
		if (user == null || user.getBirthDate() == null) {
			return null;
		}
		return NatalChartCalculator.compute(user.getBirthDate()).get(0).signSymbol();
	}

	@Transactional(readOnly = true)
	public void assertHaveMatch(UUID userId, UUID otherUserId) {
		UUID low = userId.compareTo(otherUserId) < 0 ? userId : otherUserId;
		UUID high = userId.compareTo(otherUserId) < 0 ? otherUserId : userId;
		if (matchRepository.findByUserLowAndUserHigh(low, high).isEmpty()) {
			throw new MatchNotFoundException();
		}
	}

	@Transactional(readOnly = true)
	public Match requireParticipant(UUID matchId, UUID userId) {
		Match m = matchRepository.findById(matchId).orElseThrow(MatchNotFoundException::new);
		if (!m.getUserLow().equals(userId) && !m.getUserHigh().equals(userId)) {
			throw new MatchAccessDeniedException();
		}
		return m;
	}
}
