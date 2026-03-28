package com.astromatch.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "astromatch.jwt")
public class JwtProperties {

	/**
	 * HMAC secret — use env in production; must be long enough for HS256.
	 */
	private String secret = "dev-only-change-me-use-at-least-256-bits-for-hs256-astromatch";

	private int accessTokenMinutes = 15;

	private int refreshTokenDays = 30;

	public String getSecret() {
		return secret;
	}

	public void setSecret(String secret) {
		this.secret = secret;
	}

	public int getAccessTokenMinutes() {
		return accessTokenMinutes;
	}

	public void setAccessTokenMinutes(int accessTokenMinutes) {
		this.accessTokenMinutes = accessTokenMinutes;
	}

	public int getRefreshTokenDays() {
		return refreshTokenDays;
	}

	public void setRefreshTokenDays(int refreshTokenDays) {
		this.refreshTokenDays = refreshTokenDays;
	}
}
