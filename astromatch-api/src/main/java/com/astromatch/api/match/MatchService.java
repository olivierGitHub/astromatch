package com.astromatch.api.match;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.astromatch.api.feed.SwipeAction;
import com.astromatch.api.feed.SwipeEventRepository;
import com.astromatch.api.identity.User;
import com.astromatch.api.identity.UserRepository;
import com.astromatch.api.safety.UserBlockRepository;

@Service
public class MatchService {

	private final MatchRepository matchRepository;
	private final SwipeEventRepository swipeEventRepository;
	private final UserRepository userRepository;
	private final UserBlockRepository userBlockRepository;
	private final PushNotificationService pushNotificationService;

	public MatchService(MatchRepository matchRepository, SwipeEventRepository swipeEventRepository,
			UserRepository userRepository, UserBlockRepository userBlockRepository,
			PushNotificationService pushNotificationService) {
		this.matchRepository = matchRepository;
		this.swipeEventRepository = swipeEventRepository;
		this.userRepository = userRepository;
		this.userBlockRepository = userBlockRepository;
		this.pushNotificationService = pushNotificationService;
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
		return new MatchDtos.MatchCreatedDto(m.getId().toString(), targetId.toString());
	}

	@Transactional(readOnly = true)
	public List<MatchDtos.MatchSummaryDto> listMatches(UUID userId) {
		List<Match> rows = matchRepository.findAllForUser(userId);
		List<MatchDtos.MatchSummaryDto> out = new ArrayList<>();
		for (Match m : rows) {
			UUID other = m.getUserLow().equals(userId) ? m.getUserHigh() : m.getUserLow();
			if (userBlockRepository.existsEitherDirection(userId, other)) {
				continue;
			}
			User u = userRepository.findById(other).orElse(null);
			String email = u != null ? u.getEmail() : "unknown@invalid";
			out.add(new MatchDtos.MatchSummaryDto(m.getId().toString(), other.toString(), email));
		}
		return out;
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
