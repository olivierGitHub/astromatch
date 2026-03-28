package com.astromatch.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "astromatch.identity")
public class IdentityPolicyProperties {

	private int minimumAgeYears = 18;

	public int getMinimumAgeYears() {
		return minimumAgeYears;
	}

	public void setMinimumAgeYears(int minimumAgeYears) {
		this.minimumAgeYears = minimumAgeYears;
	}
}
