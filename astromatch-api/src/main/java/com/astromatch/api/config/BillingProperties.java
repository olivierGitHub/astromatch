package com.astromatch.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "astromatch.billing")
public class BillingProperties {

	/**
	 * When true, accepts non-empty receipt payloads for development; production must use store validation.
	 */
	private boolean stubValidationEnabled = true;

	private String productSwipePack = "com.astromatch.swipe_pack";

	private String productAlignmentBoost = "com.astromatch.alignment_boost";

	private String productLocationPass = "com.astromatch.location_pass";

	private int swipePackBonusLikes = 5;

	private int boostDurationHours = 24;

	private int locationPassDurationHours = 24;

	public boolean isStubValidationEnabled() {
		return stubValidationEnabled;
	}

	public void setStubValidationEnabled(boolean stubValidationEnabled) {
		this.stubValidationEnabled = stubValidationEnabled;
	}

	public String getProductSwipePack() {
		return productSwipePack;
	}

	public void setProductSwipePack(String productSwipePack) {
		this.productSwipePack = productSwipePack;
	}

	public String getProductAlignmentBoost() {
		return productAlignmentBoost;
	}

	public void setProductAlignmentBoost(String productAlignmentBoost) {
		this.productAlignmentBoost = productAlignmentBoost;
	}

	public String getProductLocationPass() {
		return productLocationPass;
	}

	public void setProductLocationPass(String productLocationPass) {
		this.productLocationPass = productLocationPass;
	}

	public int getSwipePackBonusLikes() {
		return swipePackBonusLikes;
	}

	public void setSwipePackBonusLikes(int swipePackBonusLikes) {
		this.swipePackBonusLikes = swipePackBonusLikes;
	}

	public int getBoostDurationHours() {
		return boostDurationHours;
	}

	public void setBoostDurationHours(int boostDurationHours) {
		this.boostDurationHours = boostDurationHours;
	}

	public int getLocationPassDurationHours() {
		return locationPassDurationHours;
	}

	public void setLocationPassDurationHours(int locationPassDurationHours) {
		this.locationPassDurationHours = locationPassDurationHours;
	}
}
