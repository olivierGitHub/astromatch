package com.astromatch.api.common.api;

import java.util.Map;

/**
 * REST response envelope per architecture: success has {@code error: null} (serialized explicitly).
 */
public record ApiEnvelope<T>(T data, Map<String, Object> meta, ApiError error) {

	public static <T> ApiEnvelope<T> success(T data) {
		return new ApiEnvelope<>(data, Map.of(), null);
	}

	public static <T> ApiEnvelope<T> error(ApiError error) {
		return new ApiEnvelope<>(null, Map.of(), error);
	}
}
