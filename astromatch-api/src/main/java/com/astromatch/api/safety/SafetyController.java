package com.astromatch.api.safety;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.astromatch.api.common.api.ApiEnvelope;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/safety")
public class SafetyController {

	private final SafetyService safetyService;

	public SafetyController(SafetyService safetyService) {
		this.safetyService = safetyService;
	}

	@PostMapping("/report")
	public ResponseEntity<ApiEnvelope<SafetyDtos.ReportSubmittedDto>> report(@AuthenticationPrincipal UUID userId,
			@Valid @RequestBody SafetyDtos.ReportRequest body) {
		return ResponseEntity.ok(ApiEnvelope.success(safetyService.submitReport(userId, body)));
	}

	@PostMapping("/block")
	public ResponseEntity<ApiEnvelope<Void>> block(@AuthenticationPrincipal UUID userId,
			@Valid @RequestBody SafetyDtos.BlockRequest body) {
		safetyService.blockUser(userId, body.blockedUserId());
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}

	@DeleteMapping("/blocks/{blockedUserId}")
	public ResponseEntity<ApiEnvelope<Void>> unblock(@AuthenticationPrincipal UUID userId,
			@PathVariable UUID blockedUserId) {
		safetyService.unblockUser(userId, blockedUserId);
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}

	@GetMapping("/blocks")
	public ResponseEntity<ApiEnvelope<SafetyDtos.BlockListDto>> listBlocks(@AuthenticationPrincipal UUID userId) {
		return ResponseEntity.ok(ApiEnvelope.success(safetyService.listBlocked(userId)));
	}
}
