package com.astromatch.api.identity;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.astromatch.api.common.api.ApiEnvelope;

import jakarta.validation.Valid;

@RestController
public class RegistrationController {

	private final RegistrationService registrationService;

	public RegistrationController(RegistrationService registrationService) {
		this.registrationService = registrationService;
	}

	@PostMapping("/api/v1/auth/register")
	public ResponseEntity<ApiEnvelope<RegisterResponse>> register(@Valid @RequestBody RegisterRequest request) {
		User user = registrationService.register(request);
		var body = new RegisterResponse(user.getId().toString(), user.getEmail());
		return ResponseEntity.status(HttpStatus.CREATED).body(ApiEnvelope.success(body));
	}
}
