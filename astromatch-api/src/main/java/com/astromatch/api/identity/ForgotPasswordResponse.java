package com.astromatch.api.identity;

/**
 * Always returns sent=true when the request is accepted (no email enumeration).
 * resetToken is only populated when {@code astromatch.recovery.expose-reset-token=true}.
 */
public record ForgotPasswordResponse(boolean sent, String resetToken) {
}
