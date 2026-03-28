package com.astromatch.api.profile;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserConsentRepository extends JpaRepository<UserConsent, UserConsentKey> {

	List<UserConsent> findById_UserId(UUID userId);

	@Modifying
	@Query("delete from UserConsent c where c.id.userId = :userId")
	void deleteByUserId(@Param("userId") UUID userId);
}
