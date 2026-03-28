package com.astromatch.api.profile;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.astromatch.api.common.api.ApiEnvelope;

@RestController
public class LegalController {

	private static final String PRIVACY = """
			astromatch privacy (MVP summary)

			• Birth date, birth place, and birth time (or “unknown”) help us interpret cosmic context for matching. \
			We do not show raw engine rules or numeric compatibility scores in the app.

			• Current location (device or manual city) is used for feed and locality cues as described in product settings.

			• You can delete your account from the app; we remove associated profile data per our retention policy.

			Optional consents (notifications, analytics) can be changed anytime and are not required for core use.
			""";

	@GetMapping("/api/v1/legal/privacy")
	public ResponseEntity<ApiEnvelope<PrivacyNoticeResponse>> privacy() {
		return ResponseEntity.ok(ApiEnvelope.success(new PrivacyNoticeResponse(PRIVACY.trim())));
	}

	public record PrivacyNoticeResponse(String content) {
	}
}
