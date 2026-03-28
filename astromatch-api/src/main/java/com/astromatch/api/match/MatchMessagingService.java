package com.astromatch.api.match;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.astromatch.api.profile.ProfileRequestException;
import com.astromatch.api.safety.BlockedInteractionException;
import com.astromatch.api.safety.UserBlockRepository;

@Service
public class MatchMessagingService {

	private static final int MESSAGE_PAGE = 200;

	private final MatchMessageRepository matchMessageRepository;
	private final MatchService matchService;
	private final UserBlockRepository userBlockRepository;
	private final PushNotificationService pushNotificationService;

	public MatchMessagingService(MatchMessageRepository matchMessageRepository, MatchService matchService,
			UserBlockRepository userBlockRepository, PushNotificationService pushNotificationService) {
		this.matchMessageRepository = matchMessageRepository;
		this.matchService = matchService;
		this.userBlockRepository = userBlockRepository;
		this.pushNotificationService = pushNotificationService;
	}

	@Transactional(readOnly = true)
	public List<MatchDtos.MessageDto> listMessages(UUID userId, UUID matchId) {
		matchService.requireParticipant(matchId, userId);
		return matchMessageRepository
				.findByMatchIdOrderByCreatedAtAsc(matchId, PageRequest.of(0, MESSAGE_PAGE))
				.stream()
				.map(MatchMessagingService::toDto)
				.collect(Collectors.toList());
	}

	@Transactional
	public MatchDtos.MessageDto sendMessage(UUID userId, UUID matchId, String body) {
		String trimmed = body != null ? body.trim() : "";
		if (trimmed.isEmpty()) {
			throw new ProfileRequestException("Message body is required");
		}
		if (trimmed.length() > 4000) {
			throw new ProfileRequestException("Message too long");
		}
		Match m = matchService.requireParticipant(matchId, userId);
		assertNotBlocked(userId, m);
		MatchMessage msg = new MatchMessage();
		msg.setMatchId(matchId);
		msg.setSenderId(userId);
		msg.setBody(trimmed);
		matchMessageRepository.save(msg);

		UUID recipient = m.getUserLow().equals(userId) ? m.getUserHigh() : m.getUserLow();
		if (!recipient.equals(userId)) {
			pushNotificationService.notifyNewMessage(matchId, recipient, userId, trimmed);
		}
		return toDto(msg);
	}

	private void assertNotBlocked(UUID userId, Match m) {
		UUID other = m.getUserLow().equals(userId) ? m.getUserHigh() : m.getUserLow();
		if (userBlockRepository.existsEitherDirection(userId, other)) {
			throw new BlockedInteractionException();
		}
	}

	private static MatchDtos.MessageDto toDto(MatchMessage m) {
		return new MatchDtos.MessageDto(m.getId().toString(), m.getSenderId().toString(), m.getBody(),
				m.getCreatedAt().toString());
	}
}
