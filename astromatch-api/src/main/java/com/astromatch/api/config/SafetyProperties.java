package com.astromatch.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "astromatch.safety")
public class SafetyProperties {

	/**
	 * Max report submissions per user per sliding hour window.
	 */
	private int reportMaxPerHourPerUser = 10;

	/**
	 * Max block actions per user per sliding 24h window (abuse prevention).
	 */
	private int blockMaxPerDayPerUser = 50;

	public int getReportMaxPerHourPerUser() {
		return reportMaxPerHourPerUser;
	}

	public void setReportMaxPerHourPerUser(int reportMaxPerHourPerUser) {
		this.reportMaxPerHourPerUser = reportMaxPerHourPerUser;
	}

	public int getBlockMaxPerDayPerUser() {
		return blockMaxPerDayPerUser;
	}

	public void setBlockMaxPerDayPerUser(int blockMaxPerDayPerUser) {
		this.blockMaxPerDayPerUser = blockMaxPerDayPerUser;
	}
}
