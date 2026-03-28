package com.astromatch.api.safety;

public class OperatorAuthException extends RuntimeException {

	public OperatorAuthException() {
		super("Invalid or missing operator credentials");
	}
}
