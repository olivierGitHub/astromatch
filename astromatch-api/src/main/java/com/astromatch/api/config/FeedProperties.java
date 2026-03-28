package com.astromatch.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "astromatch.feed")
public class FeedProperties {

	/**
	 * Free likes (not including super-likes) per UTC calendar day. Epic 5 may replace with entitlements.
	 */
	private int dailyLikeCap = 50;

	private int dailySuperLikeCap = 3;

	/**
	 * Max swipe POSTs per viewer per rolling minute (abuse / automation).
	 */
	private int swipeBurstPerMinutePerUser = 60;

	public int getDailyLikeCap() {
		return dailyLikeCap;
	}

	public void setDailyLikeCap(int dailyLikeCap) {
		this.dailyLikeCap = dailyLikeCap;
	}

	public int getDailySuperLikeCap() {
		return dailySuperLikeCap;
	}

	public void setDailySuperLikeCap(int dailySuperLikeCap) {
		this.dailySuperLikeCap = dailySuperLikeCap;
	}

	public int getSwipeBurstPerMinutePerUser() {
		return swipeBurstPerMinutePerUser;
	}

	public void setSwipeBurstPerMinutePerUser(int swipeBurstPerMinutePerUser) {
		this.swipeBurstPerMinutePerUser = swipeBurstPerMinutePerUser;
	}
}
