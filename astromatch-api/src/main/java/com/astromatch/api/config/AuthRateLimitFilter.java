package com.astromatch.api.config;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.astromatch.api.common.api.ApiEnvelope;
import com.astromatch.api.common.api.ApiError;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public class AuthRateLimitFilter extends OncePerRequestFilter {

	private static final long WINDOW_MS = 60_000L;

	private final RateLimitProperties rateLimitProperties;
	private final SlidingWindowRateLimiter limiter;
	private final ObjectMapper objectMapper;

	public AuthRateLimitFilter(RateLimitProperties rateLimitProperties, SlidingWindowRateLimiter limiter,
			ObjectMapper objectMapper) {
		this.rateLimitProperties = rateLimitProperties;
		this.limiter = limiter;
		this.objectMapper = objectMapper;
	}

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {
		if (!HttpMethod.POST.matches(request.getMethod())) {
			filterChain.doFilter(request, response);
			return;
		}
		String path = request.getRequestURI();
		if (!path.startsWith("/api/v1/auth/")) {
			filterChain.doFilter(request, response);
			return;
		}
		String ip = clientIp(request);
		String key = ip + ":" + path;
		int max = maxForPath(path);
		if (!limiter.allow(key, max, WINDOW_MS)) {
			response.setStatus(429);
			response.setContentType(MediaType.APPLICATION_JSON_VALUE);
			var env = ApiEnvelope.error(
					new ApiError("RATE_LIMITED", "Too many requests. Try again later.", null, "unknown"));
			response.getWriter().write(objectMapper.writeValueAsString(env));
			return;
		}
		filterChain.doFilter(request, response);
	}

	private int maxForPath(String path) {
		if (path.contains("/login")) {
			return rateLimitProperties.getLoginPerMinutePerIp();
		}
		if (path.contains("/register")) {
			return rateLimitProperties.getRegisterPerMinutePerIp();
		}
		if (path.contains("/forgot-password") || path.contains("/reset-password")) {
			return rateLimitProperties.getRecoveryPerMinutePerIp();
		}
		return rateLimitProperties.getOtherAuthPerMinutePerIp();
	}

	private static String clientIp(HttpServletRequest request) {
		String xff = request.getHeader("X-Forwarded-For");
		if (xff != null && !xff.isBlank()) {
			return xff.split(",")[0].trim();
		}
		return request.getRemoteAddr() != null ? request.getRemoteAddr() : "unknown";
	}
}
