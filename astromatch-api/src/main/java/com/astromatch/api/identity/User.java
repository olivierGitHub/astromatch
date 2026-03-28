package com.astromatch.api.identity;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

	@Id
	@Column(columnDefinition = "UUID")
	private UUID id;

	@Column(nullable = false, length = 255)
	private String email;

	@Column(name = "password_hash", nullable = false, length = 255)
	private String passwordHash;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "birth_date")
	private LocalDate birthDate;

	@Column(name = "onboarding_completed", nullable = false)
	private boolean onboardingCompleted;

	@Column(name = "birth_time_unknown", nullable = false)
	private boolean birthTimeUnknown;

	@Column(name = "birth_time")
	private LocalTime birthTime;

	@Column(name = "birth_place_label", length = 512)
	private String birthPlaceLabel;

	@Column(name = "birth_place_lat")
	private Double birthPlaceLat;

	@Column(name = "birth_place_lng")
	private Double birthPlaceLng;

	@Column(name = "birth_timezone", length = 128)
	private String birthTimezone;

	@Column(name = "current_location_label", length = 512)
	private String currentLocationLabel;

	@Column(name = "current_location_lat")
	private Double currentLocationLat;

	@Column(name = "current_location_lng")
	private Double currentLocationLng;

	@Column(name = "current_location_manual", nullable = false)
	private boolean currentLocationManual = true;

	@Column(name = "sought_dynamics", length = 512)
	private String soughtDynamics;

	@Column(name = "bio", length = 2000)
	private String bio;

	@Column(name = "expo_push_token", length = 512)
	private String expoPushToken;

	@Column(name = "bonus_swipe_balance", nullable = false)
	private int bonusSwipeBalance = 0;

	@Column(name = "alignment_boost_until")
	private Instant alignmentBoostUntil;

	@Column(name = "location_pass_until")
	private Instant locationPassUntil;

	@Column(name = "location_pass_label", length = 512)
	private String locationPassLabel;

	@Enumerated(EnumType.STRING)
	@Column(name = "account_status", nullable = false, length = 32)
	private AccountStatus accountStatus = AccountStatus.ACTIVE;

	public UUID getId() {
		return id;
	}

	public String getEmail() {
		return email;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public void setPasswordHash(String passwordHash) {
		this.passwordHash = passwordHash;
	}

	public LocalDate getBirthDate() {
		return birthDate;
	}

	public void setBirthDate(LocalDate birthDate) {
		this.birthDate = birthDate;
	}

	public boolean isOnboardingCompleted() {
		return onboardingCompleted;
	}

	public void setOnboardingCompleted(boolean onboardingCompleted) {
		this.onboardingCompleted = onboardingCompleted;
	}

	public boolean isBirthTimeUnknown() {
		return birthTimeUnknown;
	}

	public void setBirthTimeUnknown(boolean birthTimeUnknown) {
		this.birthTimeUnknown = birthTimeUnknown;
	}

	public LocalTime getBirthTime() {
		return birthTime;
	}

	public void setBirthTime(LocalTime birthTime) {
		this.birthTime = birthTime;
	}

	public String getBirthPlaceLabel() {
		return birthPlaceLabel;
	}

	public void setBirthPlaceLabel(String birthPlaceLabel) {
		this.birthPlaceLabel = birthPlaceLabel;
	}

	public Double getBirthPlaceLat() {
		return birthPlaceLat;
	}

	public void setBirthPlaceLat(Double birthPlaceLat) {
		this.birthPlaceLat = birthPlaceLat;
	}

	public Double getBirthPlaceLng() {
		return birthPlaceLng;
	}

	public void setBirthPlaceLng(Double birthPlaceLng) {
		this.birthPlaceLng = birthPlaceLng;
	}

	public String getBirthTimezone() {
		return birthTimezone;
	}

	public void setBirthTimezone(String birthTimezone) {
		this.birthTimezone = birthTimezone;
	}

	public String getCurrentLocationLabel() {
		return currentLocationLabel;
	}

	public void setCurrentLocationLabel(String currentLocationLabel) {
		this.currentLocationLabel = currentLocationLabel;
	}

	public Double getCurrentLocationLat() {
		return currentLocationLat;
	}

	public void setCurrentLocationLat(Double currentLocationLat) {
		this.currentLocationLat = currentLocationLat;
	}

	public Double getCurrentLocationLng() {
		return currentLocationLng;
	}

	public void setCurrentLocationLng(Double currentLocationLng) {
		this.currentLocationLng = currentLocationLng;
	}

	public boolean isCurrentLocationManual() {
		return currentLocationManual;
	}

	public void setCurrentLocationManual(boolean currentLocationManual) {
		this.currentLocationManual = currentLocationManual;
	}

	public String getSoughtDynamics() {
		return soughtDynamics;
	}

	public void setSoughtDynamics(String soughtDynamics) {
		this.soughtDynamics = soughtDynamics;
	}

	public String getBio() {
		return bio;
	}

	public void setBio(String bio) {
		this.bio = bio;
	}

	public String getExpoPushToken() {
		return expoPushToken;
	}

	public void setExpoPushToken(String expoPushToken) {
		this.expoPushToken = expoPushToken;
	}

	public int getBonusSwipeBalance() {
		return bonusSwipeBalance;
	}

	public void setBonusSwipeBalance(int bonusSwipeBalance) {
		this.bonusSwipeBalance = bonusSwipeBalance;
	}

	public Instant getAlignmentBoostUntil() {
		return alignmentBoostUntil;
	}

	public void setAlignmentBoostUntil(Instant alignmentBoostUntil) {
		this.alignmentBoostUntil = alignmentBoostUntil;
	}

	public Instant getLocationPassUntil() {
		return locationPassUntil;
	}

	public void setLocationPassUntil(Instant locationPassUntil) {
		this.locationPassUntil = locationPassUntil;
	}

	public String getLocationPassLabel() {
		return locationPassLabel;
	}

	public void setLocationPassLabel(String locationPassLabel) {
		this.locationPassLabel = locationPassLabel;
	}

	public AccountStatus getAccountStatus() {
		return accountStatus;
	}

	public void setAccountStatus(AccountStatus accountStatus) {
		this.accountStatus = accountStatus;
	}

	@PrePersist
	void prePersist() {
		if (id == null) {
			id = UUID.randomUUID();
		}
		if (createdAt == null) {
			createdAt = Instant.now();
		}
	}
}
