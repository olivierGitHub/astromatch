package com.astromatch.api.profile;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProfilePhotoRepository extends JpaRepository<ProfilePhoto, UUID> {

	List<ProfilePhoto> findByUserIdOrderBySortOrderAsc(UUID userId);

	Optional<ProfilePhoto> findByIdAndUserId(UUID id, UUID userId);

	long countByUserId(UUID userId);

	@Modifying
	@Query("delete from ProfilePhoto p where p.userId = :userId")
	void deleteByUserId(@Param("userId") UUID userId);
}
