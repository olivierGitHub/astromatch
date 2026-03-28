package com.astromatch.api.profile;

import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** Eight MVP relationship dynamic labels (UX-DR3). */
public final class RelationshipDynamicsCatalog {

	private RelationshipDynamicsCatalog() {
	}

	public static final List<String> LABELS = List.of(
			"deep_connection",
			"playful_exploration",
			"slow_burn",
			"adventure_together",
			"spiritual_alignment",
			"friendship_first",
			"passion_forward",
			"co_creation");

	public static final Set<String> LABEL_SET = Collections.unmodifiableSet(new LinkedHashSet<>(LABELS));

	public static void validateLabels(List<String> labels) {
		if (labels == null) {
			return;
		}
		if (labels.size() > 2) {
			throw new ProfileRequestException("At most two dynamics are allowed");
		}
		for (String l : labels) {
			if (!LABEL_SET.contains(l)) {
				throw new ProfileRequestException("Unknown dynamic: " + l);
			}
		}
	}
}
