package com.astromatch.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "astromatch.rate-limit")
public class RateLimitProperties {

	private int loginPerMinutePerIp = 60;

	private int registerPerMinutePerIp = 30;

	private int recoveryPerMinutePerIp = 20;

	private int otherAuthPerMinutePerIp = 120;

	public int getLoginPerMinutePerIp() {
		return loginPerMinutePerIp;
	}

	public void setLoginPerMinutePerIp(int loginPerMinutePerIp) {
		this.loginPerMinutePerIp = loginPerMinutePerIp;
	}

	public int getRegisterPerMinutePerIp() {
		return registerPerMinutePerIp;
	}

	public void setRegisterPerMinutePerIp(int registerPerMinutePerIp) {
		this.registerPerMinutePerIp = registerPerMinutePerIp;
	}

	public int getRecoveryPerMinutePerIp() {
		return recoveryPerMinutePerIp;
	}

	public void setRecoveryPerMinutePerIp(int recoveryPerMinutePerIp) {
		this.recoveryPerMinutePerIp = recoveryPerMinutePerIp;
	}

	public int getOtherAuthPerMinutePerIp() {
		return otherAuthPerMinutePerIp;
	}

	public void setOtherAuthPerMinutePerIp(int otherAuthPerMinutePerIp) {
		this.otherAuthPerMinutePerIp = otherAuthPerMinutePerIp;
	}
}
