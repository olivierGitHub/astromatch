package com.astromatch.api.match;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MatchRepository extends JpaRepository<Match, UUID> {

	Optional<Match> findByUserLowAndUserHigh(UUID userLow, UUID userHigh);

	@Query("SELECT m FROM UserMatch m WHERE m.userLow = :uid OR m.userHigh = :uid ORDER BY m.createdAt DESC")
	java.util.List<Match> findAllForUser(@Param("uid") UUID userId);
}
