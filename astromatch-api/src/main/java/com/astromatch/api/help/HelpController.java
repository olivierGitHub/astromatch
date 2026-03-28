package com.astromatch.api.help;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.astromatch.api.common.api.ApiEnvelope;

@RestController
@RequestMapping("/api/v1/help")
public class HelpController {

	@GetMapping("/channels")
	public ResponseEntity<ApiEnvelope<HelpChannelsResponse>> channels() {
		return ResponseEntity.ok(ApiEnvelope.success(HelpChannelsResponse.placeholder()));
	}

	public record HelpChannel(String id, String label, String description, String contactHint) {
	}

	public record HelpChannelsResponse(List<HelpChannel> accountAndData, List<HelpChannel> billingAndPurchases) {

		static HelpChannelsResponse placeholder() {
			return new HelpChannelsResponse(
					List.of(new HelpChannel("account", "Account & data", "Privacy, export, or delete requests.",
							"mailto:support@example.com?subject=Astromatch%20account"),
							new HelpChannel("safety", "Safety", "Harassment or policy concerns.",
									"mailto:safety@example.com?subject=Astromatch%20safety")),
					List.of(new HelpChannel("billing", "Billing & purchases", "Charges, refunds, restore issues.",
							"mailto:billing@example.com?subject=Astromatch%20billing")));
		}
	}
}
