package com.astromatch.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "astromatch.operator")
public class OperatorProperties {

	/**
	 * Shared secret for {@code X-Operator-Key} on operator endpoints. Override in production.
	 */
	private String apiKey = "dev-only-operator-key-change-in-production";

	public String getApiKey() {
		return apiKey;
	}

	public void setApiKey(String apiKey) {
		this.apiKey = apiKey;
	}
}
