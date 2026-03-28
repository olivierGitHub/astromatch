package com.astromatch.api.common.web;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class TraceIdFilter extends OncePerRequestFilter {

	public static final String TRACE_ID_ATTR = "traceId";
	public static final String TRACE_ID_HEADER = "X-Trace-Id";

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		String traceId = Optional.ofNullable(request.getHeader(TRACE_ID_HEADER))
				.filter(s -> !s.isBlank())
				.orElseGet(() -> UUID.randomUUID().toString());
		request.setAttribute(TRACE_ID_ATTR, traceId);
		response.setHeader(TRACE_ID_HEADER, traceId);
		filterChain.doFilter(request, response);
	}
}
