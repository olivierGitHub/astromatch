package com.astromatch.api.identity;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Service;

import com.astromatch.api.config.JwtProperties;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

	private final JwtProperties properties;
	private final SecretKey key;

	public JwtService(JwtProperties properties) {
		this.properties = properties;
		this.key = Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8));
	}

	public String createAccessToken(UUID userId) {
		Instant now = Instant.now();
		Instant exp = now.plusSeconds(properties.getAccessTokenMinutes() * 60L);
		return Jwts.builder()
				.subject(userId.toString())
				.issuedAt(Date.from(now))
				.expiration(Date.from(exp))
				.signWith(key)
				.compact();
	}

	public UUID parseAndValidateSubject(String token) {
		try {
			Claims claims = Jwts.parser()
					.verifyWith(key)
					.build()
					.parseSignedClaims(token)
					.getPayload();
			return UUID.fromString(claims.getSubject());
		}
		catch (ExpiredJwtException e) {
			throw new InvalidTokenException("Access token expired");
		}
		catch (JwtException | IllegalArgumentException e) {
			throw new InvalidTokenException("Invalid access token");
		}
	}
}
