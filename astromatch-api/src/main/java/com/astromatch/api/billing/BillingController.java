package com.astromatch.api.billing;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.astromatch.api.common.api.ApiEnvelope;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/billing")
public class BillingController {

	private final BillingService billingService;

	public BillingController(BillingService billingService) {
		this.billingService = billingService;
	}

	@PostMapping("/purchase/validate")
	public ResponseEntity<ApiEnvelope<Void>> validatePurchase(@AuthenticationPrincipal UUID userId,
			@Valid @RequestBody BillingDtos.PurchaseValidateRequest body) {
		billingService.validatePurchase(userId, body);
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}

	@PostMapping("/restore")
	public ResponseEntity<ApiEnvelope<Void>> restore(@AuthenticationPrincipal UUID userId,
			@Valid @RequestBody BillingDtos.PurchaseRestoreRequest body) {
		billingService.restorePurchases(userId, body);
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}
}
