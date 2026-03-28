package com.astromatch.api.identity;

public class InvalidResetTokenException extends RuntimeException {

	public InvalidResetTokenException(String message) {
		super(message);
	}
}
