package com.astromatch.api.identity;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.astromatch.api.config.UploadProperties;
import com.astromatch.api.profile.ProfilePhoto;
import com.astromatch.api.profile.ProfilePhotoRepository;
import com.astromatch.api.profile.UserConsentRepository;

@Service
public class AccountDeletionService {

	private final UserRepository userRepository;
	private final RefreshTokenRepository refreshTokenRepository;
	private final PasswordResetTokenRepository passwordResetTokenRepository;
	private final UserConsentRepository userConsentRepository;
	private final ProfilePhotoRepository profilePhotoRepository;
	private final UploadProperties uploadProperties;

	public AccountDeletionService(UserRepository userRepository, RefreshTokenRepository refreshTokenRepository,
			PasswordResetTokenRepository passwordResetTokenRepository, UserConsentRepository userConsentRepository,
			ProfilePhotoRepository profilePhotoRepository, UploadProperties uploadProperties) {
		this.userRepository = userRepository;
		this.refreshTokenRepository = refreshTokenRepository;
		this.passwordResetTokenRepository = passwordResetTokenRepository;
		this.userConsentRepository = userConsentRepository;
		this.profilePhotoRepository = profilePhotoRepository;
		this.uploadProperties = uploadProperties;
	}

	@Transactional
	public void deleteAccount(UUID userId) throws IOException {
		refreshTokenRepository.deleteByUserId(userId);
		passwordResetTokenRepository.deleteAllByUserId(userId);
		userConsentRepository.deleteByUserId(userId);
		Path dir = Path.of(uploadProperties.getDir());
		for (ProfilePhoto p : profilePhotoRepository.findByUserIdOrderBySortOrderAsc(userId)) {
			Files.deleteIfExists(dir.resolve(p.getStorageFilename()));
		}
		profilePhotoRepository.deleteByUserId(userId);
		userRepository.deleteById(userId);
	}
}
