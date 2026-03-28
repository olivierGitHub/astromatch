package com.astromatch.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "astromatch.recovery")
public class RecoveryProperties {

	/**
	 * When true, forgot-password response includes the raw reset token (local/dev only).
	 */
	private boolean exposeResetToken = false;

	private int forgotPasswordCooldownSeconds = 60;

	private int resetTokenMinutes = 60;

	public boolean isExposeResetToken() {
		return exposeResetToken;
	}

	public void setExposeResetToken(boolean exposeResetToken) {
		this.exposeResetToken = exposeResetToken;
	}

	public int getForgotPasswordCooldownSeconds() {
		return forgotPasswordCooldownSeconds;
	}

	public void setForgotPasswordCooldownSeconds(int forgotPasswordCooldownSeconds) {
		this.forgotPasswordCooldownSeconds = forgotPasswordCooldownSeconds;
	}

	public int getResetTokenMinutes() {
		return resetTokenMinutes;
	}

	public void setResetTokenMinutes(int resetTokenMinutes) {
		this.resetTokenMinutes = resetTokenMinutes;
	}
}
