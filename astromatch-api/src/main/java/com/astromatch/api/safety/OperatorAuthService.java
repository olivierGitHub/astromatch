package com.astromatch.api.safety;

import org.springframework.stereotype.Service;

import com.astromatch.api.config.OperatorProperties;

@Service
public class OperatorAuthService {

	private final OperatorProperties operatorProperties;

	public OperatorAuthService(OperatorProperties operatorProperties) {
		this.operatorProperties = operatorProperties;
	}

	public void requireValidKey(String header) {
		String expected = operatorProperties.getApiKey();
		if (expected == null || expected.isBlank()) {
			throw new OperatorAuthException();
		}
		if (header == null || header.isBlank() || !expected.equals(header)) {
			throw new OperatorAuthException();
		}
	}
}
