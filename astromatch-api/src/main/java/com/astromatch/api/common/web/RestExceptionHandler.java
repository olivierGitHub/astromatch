package com.astromatch.api.common.web;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import java.sql.SQLException;

import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.astromatch.api.common.api.ApiEnvelope;
import com.astromatch.api.common.api.ApiError;
import com.astromatch.api.identity.AgePolicyException;
import com.astromatch.api.profile.ProfileRequestException;
import com.astromatch.api.identity.EmailAlreadyExistsException;
import com.astromatch.api.identity.InvalidResetTokenException;
import com.astromatch.api.identity.InvalidTokenException;
import com.astromatch.api.identity.RateLimitExceededException;
import com.astromatch.api.feed.FeedQuotaExceededException;
import com.astromatch.api.feed.InvalidSwipeTargetException;
import com.astromatch.api.billing.BillingValidationException;
import com.astromatch.api.match.MatchAccessDeniedException;
import com.astromatch.api.match.MatchNotFoundException;
import com.astromatch.api.safety.BlockedInteractionException;
import com.astromatch.api.safety.OperatorAuthException;

@RestControllerAdvice
public class RestExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(RestExceptionHandler.class);

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleValidation(MethodArgumentNotValidException ex,
			HttpServletRequest request) {
		String traceId = traceId(request);
		List<Map<String, String>> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
				.map(fe -> {
					Map<String, String> m = new LinkedHashMap<>();
					m.put("field", fe.getField());
					m.put("message", fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "invalid");
					return m;
				})
				.collect(Collectors.toList());
		var err = new ApiError("VALIDATION_ERROR", "Request validation failed", fieldErrors, traceId);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleUnreadable(HttpMessageNotReadableException ex,
			HttpServletRequest request) {
		String traceId = traceId(request);
		var err = new ApiError("VALIDATION_ERROR", "Malformed JSON body", null, traceId);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(ProfileRequestException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleProfileRequest(ProfileRequestException ex,
			HttpServletRequest request) {
		String traceId = traceId(request);
		var err = new ApiError("PROFILE_VALIDATION", ex.getMessage(), null, traceId);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(AgePolicyException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleAgePolicy(AgePolicyException ex, HttpServletRequest request) {
		String traceId = traceId(request);
		var err = new ApiError("AGE_REQUIREMENT_NOT_MET", ex.getMessage(), null, traceId);
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(BadCredentialsException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleBadCredentials(BadCredentialsException ex,
			HttpServletRequest request) {
		String traceId = traceId(request);
		var err = new ApiError("INVALID_CREDENTIALS", "Invalid email or password", null, traceId);
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(InvalidTokenException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleInvalidToken(InvalidTokenException ex,
			HttpServletRequest request) {
		String traceId = traceId(request);
		var err = new ApiError("INVALID_REFRESH_TOKEN", ex.getMessage(), null, traceId);
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(InvalidResetTokenException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleInvalidResetToken(InvalidResetTokenException ex,
			HttpServletRequest request) {
		String traceId = traceId(request);
		var err = new ApiError("INVALID_RESET_TOKEN", ex.getMessage(), null, traceId);
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(RateLimitExceededException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleRateLimit(RateLimitExceededException ex,
			HttpServletRequest request) {
		String traceId = traceId(request);
		var err = new ApiError("RATE_LIMITED", "Too many attempts. Try again later.", null, traceId);
		return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(FeedQuotaExceededException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleFeedQuota(FeedQuotaExceededException ex,
			HttpServletRequest request) {
		String traceId = traceId(request);
		var err = new ApiError("QUOTA_EXCEEDED", ex.getMessage(), null, traceId);
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(InvalidSwipeTargetException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleInvalidSwipe(InvalidSwipeTargetException ex,
			HttpServletRequest request) {
		String traceId = traceId(request);
		var err = new ApiError("SWIPE_TARGET_INVALID", ex.getMessage(), null, traceId);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(BillingValidationException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleBillingValidation(BillingValidationException ex,
			HttpServletRequest request) {
		String traceId = traceId(request);
		var err = new ApiError("BILLING_VALIDATION_FAILED", ex.getMessage(), null, traceId);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(MatchNotFoundException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleMatchNotFound(MatchNotFoundException ex,
			HttpServletRequest request) {
		String traceId = traceId(request);
		var err = new ApiError("MATCH_NOT_FOUND", "Match not found", null, traceId);
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(MatchAccessDeniedException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleMatchAccess(MatchAccessDeniedException ex,
			HttpServletRequest request) {
		String traceId = traceId(request);
		var err = new ApiError("MATCH_ACCESS_DENIED", "Not part of this match", null, traceId);
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(BlockedInteractionException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleBlockedInteraction(BlockedInteractionException ex,
			HttpServletRequest request) {
		String traceId = traceId(request);
		var err = new ApiError("BLOCKED_USER", ex.getMessage(), null, traceId);
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(OperatorAuthException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleOperatorAuth(OperatorAuthException ex,
			HttpServletRequest request) {
		String traceId = traceId(request);
		var err = new ApiError("OPERATOR_AUTH_INVALID", ex.getMessage(), null, traceId);
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(EmailAlreadyExistsException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleDuplicateEmail(EmailAlreadyExistsException ex,
			HttpServletRequest request) {
		return duplicateEmailResponse(request);
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleDataIntegrity(DataIntegrityViolationException ex,
			HttpServletRequest request) {
		if (isLikelyDuplicateEmail(ex)) {
			return duplicateEmailResponse(request);
		}
		log.error("Data integrity violation", ex);
		String traceId = traceId(request);
		var err = new ApiError("INTERNAL_ERROR", "An unexpected error occurred", null, traceId);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ApiEnvelope<Void>> handleAccessDenied(AccessDeniedException ex,
			HttpServletRequest request) {
		String traceId = traceId(request);
		var err = new ApiError("ACCESS_DENIED", "Access denied", null, traceId);
		return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiEnvelope.error(err));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiEnvelope<Void>> handleGeneric(Exception ex, HttpServletRequest request) {
		log.error("Unhandled exception", ex);
		String traceId = traceId(request);
		var err = new ApiError("INTERNAL_ERROR", "An unexpected error occurred", null, traceId);
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(ApiEnvelope.error(err));
	}

	private ResponseEntity<ApiEnvelope<Void>> duplicateEmailResponse(HttpServletRequest request) {
		String traceId = traceId(request);
		var err = new ApiError("EMAIL_ALREADY_EXISTS", "An account with this email already exists", null, traceId);
		return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiEnvelope.error(err));
	}

	/**
	 * Covers optimistic check + concurrent insert race (unique index on email).
	 */
	private static boolean isLikelyDuplicateEmail(DataIntegrityViolationException ex) {
		String msg = String.valueOf(ex.getMessage());
		String combined = msg;
		Throwable cause = ex.getCause();
		while (cause != null) {
			combined += " " + cause.getMessage();
			if (cause instanceof SQLException sql) {
				String state = sql.getSQLState();
				if ("23505".equals(state)) {
					return combined.toLowerCase().contains("email") || combined.contains("uq_users_email");
				}
			}
			cause = cause.getCause();
		}
		return msg.toUpperCase().contains("UQ_USERS_EMAIL") || msg.toLowerCase().contains("uq_users_email");
	}

	private static String traceId(HttpServletRequest request) {
		Object v = request.getAttribute(TraceIdFilter.TRACE_ID_ATTR);
		return v != null ? v.toString() : "unknown";
	}
}
