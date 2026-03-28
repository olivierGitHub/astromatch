package com.astromatch.api.identity;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RegistrationService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final AgePolicyService agePolicyService;

	public RegistrationService(UserRepository userRepository, PasswordEncoder passwordEncoder,
			AgePolicyService agePolicyService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.agePolicyService = agePolicyService;
	}

	@Transactional
	public User register(RegisterRequest request) {
		String email = normalizeEmail(request.email());
		if (userRepository.existsByEmail(email)) {
			throw new EmailAlreadyExistsException();
		}
		agePolicyService.assertMeetsMinimumAge(request.birthDate());
		User user = new User();
		user.setEmail(email);
		user.setPasswordHash(passwordEncoder.encode(request.password()));
		user.setBirthDate(request.birthDate());
		return userRepository.save(user);
	}

	private static String normalizeEmail(String email) {
		return email.trim().toLowerCase();
	}
}
