package com.astromatch.api.identity;

public record TokenBundle(String accessToken, String refreshToken, String tokenType, int expiresIn, String email) {
}
