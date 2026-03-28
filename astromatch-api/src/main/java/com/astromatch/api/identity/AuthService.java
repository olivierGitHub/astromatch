package com.astromatch.api.identity;

import java.time.Instant;
import java.util.UUID;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.astromatch.api.config.JwtProperties;
import com.astromatch.api.config.RecoveryProperties;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final PasswordResetTokenRepository passwordResetTokenRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final JwtProperties jwtProperties;
	private final RecoveryProperties recoveryProperties;
	private final ForgotPasswordRateLimiter forgotPasswordRateLimiter;

	public AuthService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
			PasswordResetTokenRepository passwordResetTokenRepository, PasswordEncoder passwordEncoder,
			JwtService jwtService, JwtProperties jwtProperties, RecoveryProperties recoveryProperties,
			ForgotPasswordRateLimiter forgotPasswordRateLimiter) {
		this.userRepository = userRepository;
		this.refreshTokenRepository = refreshTokenRepository;
		this.passwordResetTokenRepository = passwordResetTokenRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.jwtProperties = jwtProperties;
		this.recoveryProperties = recoveryProperties;
		this.forgotPasswordRateLimiter = forgotPasswordRateLimiter;
	}

	@Transactional
	public TokenBundle login(LoginRequest request) {
		String email = normalizeEmail(request.email());
		User user = userRepository.findByEmail(email).orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
		if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
			throw new BadCredentialsException("Invalid credentials");
		}
		return issueTokensForUser(user.getId(), UUID.randomUUID());
	}

	@Transactional
	public TokenBundle refresh(RefreshRequest request) {
		String hash = TokenHasher.sha256Hex(request.refreshToken());
		RefreshToken row = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(hash)
				.orElseThrow(() -> new InvalidTokenException("Invalid or expired refresh token"));
		if (row.getExpiresAt().isBefore(Instant.now())) {
			throw new InvalidTokenException("Invalid or expired refresh token");
		}
		row.setRevokedAt(Instant.now());
		refreshTokenRepository.save(row);
		return issueTokensForUser(row.getUserId(), row.getFamilyId());
	}

	@Transactional
	public void logout(LogoutRequest request) {
		String hash = TokenHasher.sha256Hex(request.refreshToken());
		refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(hash).ifPresent(row -> {
			row.setRevokedAt(Instant.now());
			refreshTokenRepository.save(row);
		});
	}

	@Transactional
	public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest request) {
		String email = normalizeEmail(request.email());
		forgotPasswordRateLimiter.checkAndRecord(email);
		var userOpt = userRepository.findByEmail(email);
		if (userOpt.isEmpty()) {
			return new ForgotPasswordResponse(true, null);
		}
		User user = userOpt.get();
		passwordResetTokenRepository.deleteUnusedForUser(user.getId());
		String raw = TokenHasher.newOpaqueRefreshToken();
		String tokenHash = TokenHasher.sha256Hex(raw);
		Instant exp = Instant.now().plusSeconds(recoveryProperties.getResetTokenMinutes() * 60L);
		PasswordResetToken entity = new PasswordResetToken();
		entity.setUserId(user.getId());
		entity.setTokenHash(tokenHash);
		entity.setExpiresAt(exp);
		passwordResetTokenRepository.save(entity);
		String exposed = recoveryProperties.isExposeResetToken() ? raw : null;
		return new ForgotPasswordResponse(true, exposed);
	}

	@Transactional
	public void resetPassword(ResetPasswordRequest request) {
		String hash = TokenHasher.sha256Hex(request.token());
		PasswordResetToken row = passwordResetTokenRepository.findByTokenHashAndUsedAtIsNull(hash)
				.orElseThrow(() -> new InvalidResetTokenException("Invalid or expired reset token"));
		if (row.getExpiresAt().isBefore(Instant.now())) {
			throw new InvalidResetTokenException("Invalid or expired reset token");
		}
		User user = userRepository.findById(row.getUserId()).orElseThrow();
		user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
		userRepository.save(user);
		row.setUsedAt(Instant.now());
		passwordResetTokenRepository.save(row);
		refreshTokenRepository.revokeAllActiveForUser(user.getId(), Instant.now());
	}

	private TokenBundle issueTokensForUser(UUID userId, UUID familyId) {
		String accessToken = jwtService.createAccessToken(userId);
		String rawRefresh = TokenHasher.newOpaqueRefreshToken();
		String refreshHash = TokenHasher.sha256Hex(rawRefresh);
		Instant exp = Instant.now().plusSeconds(jwtProperties.getRefreshTokenDays() * 86400L);
		RefreshToken entity = new RefreshToken();
		entity.setUserId(userId);
		entity.setTokenHash(refreshHash);
		entity.setFamilyId(familyId);
		entity.setExpiresAt(exp);
		refreshTokenRepository.save(entity);
		int expiresInSeconds = jwtProperties.getAccessTokenMinutes() * 60;
		User user = userRepository.findById(userId).orElseThrow();
		return new TokenBundle(accessToken, rawRefresh, "Bearer", expiresInSeconds, user.getEmail());
	}

	private static String normalizeEmail(String email) {
		return email.trim().toLowerCase();
	}
}
