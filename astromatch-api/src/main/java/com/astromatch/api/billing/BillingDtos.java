package com.astromatch.api.billing;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class BillingDtos {

	private BillingDtos() {
	}

	public record PurchaseValidateRequest(@NotBlank String platform, @NotBlank String productId, String receiptData,
			String transactionId, @Size(max = 512) String destinationLabel) {
	}

	public record PurchaseRestoreRequest(@Valid List<PurchaseRestoreItem> items) {
		public PurchaseRestoreRequest {
			if (items == null) {
				items = List.of();
			}
		}
	}

	public record PurchaseRestoreItem(@NotBlank String platform, @NotBlank String productId, String transactionId,
			String receiptData, @Size(max = 512) String destinationLabel) {
	}
}
