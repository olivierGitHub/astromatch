package com.astromatch.api.common.api;

public record ApiError(String code, String message, Object details, String traceId) {
}
