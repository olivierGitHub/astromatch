package com.astromatch.api.match;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatchMessageRepository extends JpaRepository<MatchMessage, UUID> {

	List<MatchMessage> findByMatchIdOrderByCreatedAtAsc(UUID matchId, Pageable pageable);

	Optional<MatchMessage> findFirstByMatchIdOrderByCreatedAtDesc(UUID matchId);
}
