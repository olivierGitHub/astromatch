package com.astromatch.api.identity;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;

import com.astromatch.api.common.api.ApiEnvelope;

@RestController
public class AccountController {

	private final AccountDeletionService accountDeletionService;

	public AccountController(AccountDeletionService accountDeletionService) {
		this.accountDeletionService = accountDeletionService;
	}

	@DeleteMapping("/api/v1/account")
	public ResponseEntity<ApiEnvelope<Void>> deleteAccount(@AuthenticationPrincipal UUID userId) throws Exception {
		accountDeletionService.deleteAccount(userId);
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}
}
