package com.astromatch.api.profile;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.astromatch.api.common.api.ApiEnvelope;

@RestController
public class PlacesController {

	@GetMapping("/api/v1/places/search")
	public ResponseEntity<ApiEnvelope<PlaceSearchResponse>> search(@RequestParam("q") String q) {
		String needle = q == null ? "" : q.trim().toLowerCase();
		List<PlaceSuggestion> all = List.of(
				new PlaceSuggestion("Paris, France", 48.8566, 2.3522, "Europe/Paris"),
				new PlaceSuggestion("Lyon, France", 45.7640, 4.8357, "Europe/Paris"),
				new PlaceSuggestion("Montreal, Canada", 45.5017, -73.5673, "America/Montreal"),
				new PlaceSuggestion("New York, USA", 40.7128, -74.0060, "America/New_York"));
		List<PlaceSuggestion> filtered = all.stream()
				.filter(p -> needle.isEmpty() || p.label().toLowerCase().contains(needle))
				.toList();
		return ResponseEntity.ok(ApiEnvelope.success(new PlaceSearchResponse(filtered)));
	}

	public record PlaceSearchResponse(List<PlaceSuggestion> places) {
	}

	public record PlaceSuggestion(String label, double lat, double lng, String timezone) {
	}
}
