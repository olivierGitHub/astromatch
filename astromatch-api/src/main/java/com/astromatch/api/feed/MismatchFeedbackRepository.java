package com.astromatch.api.feed;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MismatchFeedbackRepository extends JpaRepository<MismatchFeedbackEvent, UUID> {

	boolean existsByViewerIdAndTargetUserId(UUID viewerId, UUID targetUserId);
}
