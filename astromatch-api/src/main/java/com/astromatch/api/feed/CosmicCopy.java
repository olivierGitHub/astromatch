package com.astromatch.api.feed;

import java.util.Objects;
import java.util.UUID;

/**
 * Opaque, non-deterministic-feeling copy for feed cards (no scores or percentages).
 */
public final class CosmicCopy {

	private static final String[] LINES = {
			"A soft lunar cadence meets grounded presence—let curiosity lead, not labels.",
			"Mutable tones invite exploration; the right rhythm shows up in the pause between you.",
			"Earth and water undertones suggest steadiness with room to flow together.",
			"Air lifts the story: conversation and contrast without turning connection into a tally.",
			"Fire stays subtle here—warmth without pressure, intent without a scoreboard.",
			"Seasonal shift energy: what fits today may deepen tomorrow; stay open to the arc.",
			"Complementary textures rather than opposition—space for both mystery and clarity.",
			"Alignment shows up as ease, not arithmetic; trust what feels mutual and kind."
	};

	private CosmicCopy() {
	}

	public static String lineFor(UUID viewerId, UUID candidateId) {
		int idx = Math.floorMod(Objects.hash(viewerId, candidateId), LINES.length);
		return LINES[idx];
	}
}
