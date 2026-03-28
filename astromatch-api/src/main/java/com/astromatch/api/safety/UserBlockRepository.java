package com.astromatch.api.safety;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserBlockRepository extends JpaRepository<UserBlock, UserBlockId> {

	@Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END FROM UserBlock b WHERE "
			+ "(b.id.blockerId = :a AND b.id.blockedUserId = :b) OR (b.id.blockerId = :b AND b.id.blockedUserId = :a)")
	boolean existsEitherDirection(@Param("a") UUID a, @Param("b") UUID b);

	List<UserBlock> findByIdBlockerIdOrderByCreatedAtDesc(UUID blockerId);

	boolean existsByIdBlockerIdAndIdBlockedUserId(UUID blockerId, UUID blockedUserId);
}
