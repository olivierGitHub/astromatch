package com.astromatch.api.config;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.astromatch.api.identity.InvalidTokenException;
import com.astromatch.api.identity.JwtService;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;

	public JwtAuthenticationFilter(JwtService jwtService) {
		this.jwtService = jwtService;
	}

	@Override
	protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {
		String token = resolveBearerToken(request);
		if (token != null) {
			try {
				UUID userId = jwtService.parseAndValidateSubject(token);
				var auth = new UsernamePasswordAuthenticationToken(userId, null,
						List.of(new SimpleGrantedAuthority("ROLE_USER")));
				SecurityContextHolder.getContext().setAuthentication(auth);
			}
			catch (InvalidTokenException ignored) {
				// Leave context empty; protected routes return 401 via entry point
			}
		}
		filterChain.doFilter(request, response);
	}

	private static String resolveBearerToken(HttpServletRequest request) {
		String header = request.getHeader("Authorization");
		if (header == null || !header.regionMatches(true, 0, "Bearer ", 0, 7)) {
			return null;
		}
		String token = header.substring(7).trim();
		return token.isEmpty() ? null : token;
	}
}
