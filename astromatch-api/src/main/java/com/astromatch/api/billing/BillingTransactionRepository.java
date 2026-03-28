package com.astromatch.api.billing;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BillingTransactionRepository extends JpaRepository<BillingTransaction, UUID> {

	boolean existsByStoreTransactionId(String storeTransactionId);
}
