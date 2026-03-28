package com.astromatch.api.safety;

public class BlockedInteractionException extends RuntimeException {

	public BlockedInteractionException() {
		super("Interaction not allowed between these accounts");
	}
}
