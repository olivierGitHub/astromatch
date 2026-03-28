package com.astromatch.api.config;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import com.astromatch.api.common.api.ApiEnvelope;
import com.astromatch.api.common.api.ApiError;
import com.astromatch.api.common.web.TraceIdFilter;
import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class JsonAccessDeniedHandler implements AccessDeniedHandler {

	private final ObjectMapper objectMapper;

	public JsonAccessDeniedHandler(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	@Override
	public void handle(HttpServletRequest request, HttpServletResponse response,
			AccessDeniedException accessDeniedException) throws IOException {
		String traceId = traceId(request);
		var err = new ApiError("ACCESS_DENIED", "Access denied", null, traceId);
		response.setStatus(HttpServletResponse.SC_FORBIDDEN);
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		objectMapper.writeValue(response.getOutputStream(), ApiEnvelope.error(err));
	}

	private static String traceId(HttpServletRequest request) {
		Object v = request.getAttribute(TraceIdFilter.TRACE_ID_ATTR);
		return v != null ? v.toString() : "unknown";
	}
}
