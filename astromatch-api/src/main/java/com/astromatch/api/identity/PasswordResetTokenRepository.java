package com.astromatch.api.identity;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, UUID> {

	Optional<PasswordResetToken> findByTokenHashAndUsedAtIsNull(String tokenHash);

	@Modifying
	@Query("delete from PasswordResetToken p where p.userId = :userId and p.usedAt is null")
	void deleteUnusedForUser(@Param("userId") UUID userId);

	@Modifying
	@Query("delete from PasswordResetToken p where p.userId = :userId")
	void deleteAllByUserId(@Param("userId") UUID userId);
}
