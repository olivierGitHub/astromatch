package com.astromatch.api.config;

import java.io.IOException;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.astromatch.api.common.api.ApiEnvelope;
import com.astromatch.api.common.api.ApiError;
import com.astromatch.api.common.web.TraceIdFilter;
import com.astromatch.api.identity.AccountStatus;
import com.astromatch.api.identity.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class AccountStatusFilter extends OncePerRequestFilter {

	private final UserRepository userRepository;
	private final ObjectMapper objectMapper;

	public AccountStatusFilter(UserRepository userRepository, ObjectMapper objectMapper) {
		this.userRepository = userRepository;
		this.objectMapper = objectMapper;
	}

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UUID userId) {
			var userOpt = userRepository.findById(userId);
			if (userOpt.isPresent()) {
				AccountStatus st = userOpt.get().getAccountStatus();
				if (st == AccountStatus.SUSPENDED || st == AccountStatus.BANNED) {
					String traceId = traceAttr(request);
					String msg = st == AccountStatus.BANNED ? "Account is banned." : "Account is suspended.";
					var err = new ApiError("ACCOUNT_RESTRICTED", msg, null, traceId);
					response.setStatus(HttpServletResponse.SC_FORBIDDEN);
					response.setContentType(MediaType.APPLICATION_JSON_VALUE);
					objectMapper.writeValue(response.getOutputStream(), ApiEnvelope.error(err));
					return;
				}
			}
		}
		filterChain.doFilter(request, response);
	}

	private static String traceAttr(HttpServletRequest request) {
		Object v = request.getAttribute(TraceIdFilter.TRACE_ID_ATTR);
		return v != null ? v.toString() : "unknown";
	}
}
