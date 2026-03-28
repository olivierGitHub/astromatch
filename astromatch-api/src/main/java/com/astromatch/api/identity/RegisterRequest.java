package com.astromatch.api.identity;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
		@NotBlank(message = "email is required") @Email(message = "email must be valid") String email,
		@NotBlank(message = "password is required") @Size(min = 8, max = 128, message = "password must be at least 8 characters") String password,
		@NotNull(message = "birthDate is required") @Past(message = "birthDate must be in the past") LocalDate birthDate) {
}
