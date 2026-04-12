package com.astromatch.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "astromatch.upload")
public class UploadProperties {

	/**
	 * Directory for profile photo files (created on demand).
	 */
	private String dir = "./var/astromatch-uploads";

	private long maxPhotoBytes = 5_242_880;

	/** Max size for a single match voice message upload. */
	private long maxVoiceBytes = 2_097_152;

	public String getDir() {
		return dir;
	}

	public void setDir(String dir) {
		this.dir = dir;
	}

	public long getMaxPhotoBytes() {
		return maxPhotoBytes;
	}

	public void setMaxPhotoBytes(long maxPhotoBytes) {
		this.maxPhotoBytes = maxPhotoBytes;
	}

	public long getMaxVoiceBytes() {
		return maxVoiceBytes;
	}

	public void setMaxVoiceBytes(long maxVoiceBytes) {
		this.maxVoiceBytes = maxVoiceBytes;
	}
}
