package com.astromatch.api.match;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.astromatch.api.config.PushProperties;
import com.astromatch.api.identity.User;
import com.astromatch.api.identity.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Service
public class ExpoPushNotificationService implements PushNotificationService {

	private static final Logger log = LoggerFactory.getLogger(ExpoPushNotificationService.class);

	private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

	private final PushProperties pushProperties;
	private final UserRepository userRepository;
	private final ObjectMapper objectMapper;
	private final HttpClient httpClient = HttpClient.newHttpClient();

	public ExpoPushNotificationService(PushProperties pushProperties, UserRepository userRepository,
			ObjectMapper objectMapper) {
		this.pushProperties = pushProperties;
		this.userRepository = userRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	public void notifyNewMatch(UUID matchId, UUID participantOneId, UUID participantTwoId) {
		if (!pushProperties.isEnabled()) {
			log.debug("Push disabled; skip match notification for {}", matchId);
			return;
		}
		sendToUser(participantOneId, participantTwoId, "It’s a match",
				"You matched with someone new. Say hello!", "MATCH", matchId);
		sendToUser(participantTwoId, participantOneId, "It’s a match",
				"You matched with someone new. Say hello!", "MATCH", matchId);
	}

	@Override
	public void notifyNewMessage(UUID matchId, UUID recipientId, UUID senderId, String bodyPreview) {
		if (!pushProperties.isEnabled()) {
			log.debug("Push disabled; skip message notification for {}", matchId);
			return;
		}
		User sender = userRepository.findById(senderId).orElse(null);
		String senderLabel = sender != null ? shortEmail(sender.getEmail()) : "Someone";
		String preview = bodyPreview.length() > 80 ? bodyPreview.substring(0, 77) + "…" : bodyPreview;
		sendToUser(recipientId, senderId, "New message from " + senderLabel, preview, "MESSAGE", matchId);
	}

	private void sendToUser(UUID toUserId, UUID otherUserId, String title, String body, String type, UUID matchId) {
		User u = userRepository.findById(toUserId).orElse(null);
		if (u == null || u.getExpoPushToken() == null || u.getExpoPushToken().isBlank()) {
			log.debug("No push token for user {}; skip (NFR-I2 observability: missing token)", toUserId);
			return;
		}
		try {
			ObjectNode msg = objectMapper.createObjectNode();
			msg.put("to", u.getExpoPushToken());
			msg.put("title", title);
			msg.put("body", body);
			ObjectNode data = msg.putObject("data");
			data.put("type", type);
			data.put("matchId", matchId.toString());
			data.put("otherUserId", otherUserId.toString());

			HttpRequest req = HttpRequest.newBuilder(URI.create(EXPO_PUSH_URL))
					.header("Content-Type", "application/json")
					.header("Accept", "application/json")
					.POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(msg), StandardCharsets.UTF_8))
					.build();
			HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
			if (res.statusCode() >= 400) {
				log.warn("Expo push failed status={} body={} (NFR-I2)", res.statusCode(), res.body());
			}
		}
		catch (Exception e) {
			log.warn("Expo push error: {} (NFR-I2)", e.getMessage());
		}
	}

	private static String shortEmail(String email) {
		if (email == null) {
			return "?";
		}
		int at = email.indexOf('@');
		return at > 0 ? email.substring(0, at) : email;
	}
}
