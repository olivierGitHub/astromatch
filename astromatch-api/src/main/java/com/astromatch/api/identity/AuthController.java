package com.astromatch.api.identity;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.astromatch.api.common.api.ApiEnvelope;
import com.astromatch.api.profile.ProfileService;

import jakarta.validation.Valid;

@RestController
public class AuthController {

	private final AuthService authService;
	private final UserRepository userRepository;
	private final ProfileService profileService;

	public AuthController(AuthService authService, UserRepository userRepository, ProfileService profileService) {
		this.authService = authService;
		this.userRepository = userRepository;
		this.profileService = profileService;
	}

	@PostMapping("/api/v1/auth/login")
	public ResponseEntity<ApiEnvelope<TokenBundle>> login(@Valid @RequestBody LoginRequest request) {
		TokenBundle tokens = authService.login(request);
		return ResponseEntity.ok(ApiEnvelope.success(tokens));
	}

	@PostMapping("/api/v1/auth/refresh")
	public ResponseEntity<ApiEnvelope<TokenBundle>> refresh(@Valid @RequestBody RefreshRequest request) {
		TokenBundle tokens = authService.refresh(request);
		return ResponseEntity.ok(ApiEnvelope.success(tokens));
	}

	@PostMapping("/api/v1/auth/logout")
	public ResponseEntity<ApiEnvelope<Void>> logout(@Valid @RequestBody LogoutRequest request) {
		authService.logout(request);
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}

	@GetMapping("/api/v1/auth/me")
	public ResponseEntity<ApiEnvelope<MeResponse>> me(@AuthenticationPrincipal UUID userId) {
		User user = userRepository.findById(userId).orElseThrow();
		var r = profileService.readiness(user);
		return ResponseEntity.ok(ApiEnvelope.success(new MeResponse(user.getId().toString(), user.getEmail(),
				r.onboardingCompleted(), r.birthProfileComplete(), r.locationComplete(), r.dynamicsComplete(),
				r.presentationComplete())));
	}

	@PostMapping("/api/v1/auth/forgot-password")
	public ResponseEntity<ApiEnvelope<ForgotPasswordResponse>> forgotPassword(
			@Valid @RequestBody ForgotPasswordRequest request) {
		return ResponseEntity.ok(ApiEnvelope.success(authService.forgotPassword(request)));
	}

	@PostMapping("/api/v1/auth/reset-password")
	public ResponseEntity<ApiEnvelope<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
		authService.resetPassword(request);
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}
}
