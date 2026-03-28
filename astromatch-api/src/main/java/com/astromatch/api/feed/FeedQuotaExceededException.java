package com.astromatch.api.feed;

public class FeedQuotaExceededException extends RuntimeException {

	public FeedQuotaExceededException(String message) {
		super(message);
	}
}
