package com.astromatch.api.feed;

import java.time.Instant;
import java.util.Collection;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SwipeEventRepository extends JpaRepository<SwipeEvent, UUID> {

	boolean existsByViewerIdAndTargetUserId(UUID viewerId, UUID targetUserId);

	boolean existsByViewerIdAndTargetUserIdAndActionIn(UUID viewerId, UUID targetUserId,
			Collection<SwipeAction> actions);

	java.util.List<SwipeEvent> findByTargetUserIdAndActionIn(UUID targetUserId, Collection<SwipeAction> actions);

	long countByViewerIdAndActionAndCreatedAtGreaterThanEqual(UUID viewerId, SwipeAction action, Instant createdAt);
}
