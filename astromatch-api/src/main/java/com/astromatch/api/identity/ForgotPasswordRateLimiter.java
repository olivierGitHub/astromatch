package com.astromatch.api.identity;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.astromatch.api.config.RecoveryProperties;

@Component
public class ForgotPasswordRateLimiter {

	private final ConcurrentHashMap<String, Instant> lastRequestByEmail = new ConcurrentHashMap<>();
	private final RecoveryProperties recoveryProperties;

	public ForgotPasswordRateLimiter(RecoveryProperties recoveryProperties) {
		this.recoveryProperties = recoveryProperties;
	}

	/**
	 * Enforces cooldown per normalized email; throws {@link RateLimitExceededException} if too soon.
	 */
	public void checkAndRecord(String normalizedEmail) {
		Instant now = Instant.now();
		int cooldown = recoveryProperties.getForgotPasswordCooldownSeconds();
		lastRequestByEmail.compute(normalizedEmail, (k, prev) -> {
			if (prev != null) {
				long elapsed = Duration.between(prev, now).getSeconds();
				if (elapsed < cooldown) {
					throw new RateLimitExceededException();
				}
			}
			return now;
		});
	}
}
