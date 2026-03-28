package com.astromatch.api.billing;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.astromatch.api.config.BillingProperties;
import com.astromatch.api.identity.User;
import com.astromatch.api.identity.UserRepository;

@Service
public class BillingService {

	private final BillingProperties billingProperties;
	private final UserRepository userRepository;
	private final BillingTransactionRepository billingTransactionRepository;

	public BillingService(BillingProperties billingProperties, UserRepository userRepository,
			BillingTransactionRepository billingTransactionRepository) {
		this.billingProperties = billingProperties;
		this.userRepository = userRepository;
		this.billingTransactionRepository = billingTransactionRepository;
	}

	@Transactional
	public void validatePurchase(UUID userId, BillingDtos.PurchaseValidateRequest req) {
		assertStubReceipt(req.receiptData(), req.transactionId());
		String txId = resolveTransactionId(userId, req.productId(), req.receiptData(), req.transactionId());
		if (billingTransactionRepository.existsByStoreTransactionId(txId)) {
			return;
		}
		User u = userRepository.findById(userId).orElseThrow();
		grantProduct(u, req.productId(), req.destinationLabel());
		persistTransaction(userId, req.platform(), req.productId(), txId);
	}

	@Transactional
	public void restorePurchases(UUID userId, BillingDtos.PurchaseRestoreRequest req) {
		for (BillingDtos.PurchaseRestoreItem item : req.items()) {
			assertStubReceipt(item.receiptData(), item.transactionId());
			String txId = resolveTransactionId(userId, item.productId(), item.receiptData(), item.transactionId());
			if (billingTransactionRepository.existsByStoreTransactionId(txId)) {
				continue;
			}
			User u = userRepository.findById(userId).orElseThrow();
			grantProduct(u, item.productId(), item.destinationLabel());
			persistTransaction(userId, item.platform(), item.productId(), txId);
		}
	}

	private void assertStubReceipt(String receiptData, String transactionId) {
		if (!billingProperties.isStubValidationEnabled()) {
			throw new BillingValidationException("Store receipt validation is not enabled in this environment");
		}
		boolean ok = (receiptData != null && receiptData.length() >= 8)
				|| (transactionId != null && !transactionId.isBlank());
		if (!ok) {
			throw new BillingValidationException("Receipt or transaction id required");
		}
	}

	private static String resolveTransactionId(UUID userId, String productId, String receiptData, String transactionId) {
		if (transactionId != null && !transactionId.isBlank()) {
			return transactionId.trim().length() > 256 ? transactionId.trim().substring(0, 256) : transactionId.trim();
		}
		try {
			MessageDigest md = MessageDigest.getInstance("SHA-256");
			String base = userId + "|" + productId + "|" + (receiptData != null ? receiptData : "");
			byte[] digest = md.digest(base.getBytes(StandardCharsets.UTF_8));
			return "stub-" + HexFormat.of().formatHex(digest);
		}
		catch (Exception e) {
			throw new BillingValidationException("Could not derive transaction id");
		}
	}

	private void grantProduct(User u, String productId, String destinationLabel) {
		if (productId.equals(billingProperties.getProductSwipePack())) {
			u.setBonusSwipeBalance(u.getBonusSwipeBalance() + billingProperties.getSwipePackBonusLikes());
		}
		else if (productId.equals(billingProperties.getProductAlignmentBoost())) {
			u.setAlignmentBoostUntil(Instant.now().plus(Duration.ofHours(billingProperties.getBoostDurationHours())));
		}
		else if (productId.equals(billingProperties.getProductLocationPass())) {
			if (destinationLabel == null || destinationLabel.isBlank()) {
				throw new BillingValidationException("Destination label is required for the location pass");
			}
			u.setLocationPassUntil(
					Instant.now().plus(Duration.ofHours(billingProperties.getLocationPassDurationHours())));
			u.setLocationPassLabel(destinationLabel.trim());
		}
		else {
			throw new BillingValidationException("Unknown product");
		}
		userRepository.save(u);
	}

	private void persistTransaction(UUID userId, String platform, String productId, String storeTransactionId) {
		BillingTransaction tx = new BillingTransaction();
		tx.setUserId(userId);
		tx.setPlatform(platform);
		tx.setProductId(productId);
		tx.setStoreTransactionId(storeTransactionId);
		billingTransactionRepository.save(tx);
	}
}
