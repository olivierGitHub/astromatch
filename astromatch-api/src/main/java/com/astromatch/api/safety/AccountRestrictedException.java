package com.astromatch.api.safety;

public class AccountRestrictedException extends RuntimeException {

	public AccountRestrictedException(String message) {
		super(message);
	}
}
