package com.astromatch.api.safety;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ModerationAuditRepository extends JpaRepository<ModerationAudit, UUID> {
}
