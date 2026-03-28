package com.astromatch.api.config;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.astromatch.api.common.api.ApiEnvelope;
import com.astromatch.api.common.api.ApiError;
import com.astromatch.api.common.web.TraceIdFilter;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {

	private final ObjectMapper objectMapper;

	public JsonAuthenticationEntryPoint(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException {
		String traceId = traceId(request);
		var err = new ApiError("UNAUTHENTICATED", "Authentication required", null, traceId);
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		objectMapper.writeValue(response.getOutputStream(), ApiEnvelope.error(err));
	}

	private static String traceId(HttpServletRequest request) {
		Object v = request.getAttribute(TraceIdFilter.TRACE_ID_ATTR);
		return v != null ? v.toString() : "unknown";
	}
}
