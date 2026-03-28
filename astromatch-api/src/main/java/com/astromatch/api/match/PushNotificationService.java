package com.astromatch.api.match;

import java.util.UUID;

public interface PushNotificationService {

	void notifyNewMatch(UUID matchId, UUID participantOneId, UUID participantTwoId);

	void notifyNewMessage(UUID matchId, UUID recipientId, UUID senderId, String bodyPreview);
}
