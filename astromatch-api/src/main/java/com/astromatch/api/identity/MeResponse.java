package com.astromatch.api.identity;

public record MeResponse(
		String userId,
		String email,
		boolean onboardingCompleted,
		boolean birthProfileComplete,
		boolean locationComplete,
		boolean dynamicsComplete,
		boolean presentationComplete) {
}
