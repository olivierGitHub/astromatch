package com.astromatch.api.identity;

import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneOffset;

import org.springframework.stereotype.Service;

import com.astromatch.api.config.IdentityPolicyProperties;

@Service
public class AgePolicyService {

	private final IdentityPolicyProperties properties;

	public AgePolicyService(IdentityPolicyProperties properties) {
		this.properties = properties;
	}

	/**
	 * @throws AgePolicyException if the person is younger than configured minimum age (as of today UTC).
	 */
	public void assertMeetsMinimumAge(LocalDate birthDate) {
		if (birthDate == null) {
			throw new AgePolicyException("Birth date is required");
		}
		LocalDate today = LocalDate.now(ZoneOffset.UTC);
		if (birthDate.isAfter(today)) {
			throw new AgePolicyException("Birth date cannot be in the future");
		}
		int age = Period.between(birthDate, today).getYears();
		if (age < properties.getMinimumAgeYears()) {
			throw new AgePolicyException(
					"You must be at least " + properties.getMinimumAgeYears() + " years old to use astromatch.");
		}
	}
}
