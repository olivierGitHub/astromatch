package com.astromatch.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class MismatchFeedbackIT {

	private static final ObjectMapper OM = new ObjectMapper();

	@LocalServerPort
	private int port;

	private final HttpClient client = HttpClient.newHttpClient();

	@Test
	void mismatchDeprioritizesTargetInFeedOrdering() throws Exception {
		String accessA = onboard("mismatch_it_a@example.com");
		onboard("mismatch_it_b@example.com");
		onboard("mismatch_it_c@example.com");

		var feed1 = getAuth("/api/v1/feed/candidates", accessA);
		assertThat(feed1.statusCode()).isEqualTo(200);
		List<String> ids1 = candidateUserIds(feed1.body());
		assertThat(ids1).hasSizeGreaterThanOrEqualTo(2);
		String firstBefore = ids1.get(0);
		String secondId = ids1.get(1);

		var post = postJsonAuth("/api/v1/feed/mismatch", accessA,
				"{\"targetUserId\":\"" + firstBefore + "\",\"focus\":\"DYNAMIC\"}");
		assertThat(post.statusCode()).isEqualTo(200);

		var feed2 = getAuth("/api/v1/feed/candidates", accessA);
		assertThat(feed2.statusCode()).isEqualTo(200);
		List<String> ids2 = candidateUserIds(feed2.body());
		assertThat(ids2).hasSizeGreaterThanOrEqualTo(2);
		assertThat(ids2.get(0)).isEqualTo(secondId);
	}

	@Test
	void mismatchRejectedAfterSwipe() throws Exception {
		String accessA = onboard("mismatch_it_d@example.com");
		String accessB = onboard("mismatch_it_e@example.com");

		String idB = extractJsonString(getAuth("/api/v1/auth/me", accessB).body(), "userId");
		assertThat(postJsonAuth("/api/v1/feed/swipe", accessA, "{\"targetUserId\":\"" + idB + "\",\"action\":\"PASS\"}")
				.statusCode()).isEqualTo(200);

		var mismatch = postJsonAuth("/api/v1/feed/mismatch", accessA,
				"{\"targetUserId\":\"" + idB + "\",\"focus\":\"PROFILE\"}");
		assertThat(mismatch.statusCode()).isEqualTo(400);
	}

	private static List<String> candidateUserIds(String body) throws Exception {
		JsonNode root = OM.readTree(body);
		JsonNode candidates = root.path("data").path("candidates");
		List<String> ids = new ArrayList<>();
		for (JsonNode c : candidates) {
			ids.add(c.get("userId").asText());
		}
		return ids;
	}

	private String onboard(String email) throws Exception {
		String password = "password12";
		assertThat(postJson("/api/v1/auth/register", "{\"email\":\"" + email + "\",\"password\":\"" + password
				+ "\",\"birthDate\":\"1992-05-05\"}").statusCode()).isEqualTo(201);
		var login = postJson("/api/v1/auth/login",
				"{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}");
		assertThat(login.statusCode()).isEqualTo(200);
		String access = extractJsonString(login.body(), "accessToken");
		putJson("/api/v1/me/consents", access, "{\"privacy_ack\":true}");
		putJson("/api/v1/me/profile/birth", access,
				"{\"birthTimeUnknown\":true,\"birthTime\":null,\"birthPlaceLabel\":\"Paris, France\","
						+ "\"birthPlaceLat\":48.85,\"birthPlaceLng\":2.35,\"birthTimezone\":\"Europe/Paris\"}");
		putJson("/api/v1/me/profile/location", access,
				"{\"label\":\"Lyon, France\",\"lat\":45.76,\"lng\":4.83,\"manual\":true}");
		putJson("/api/v1/me/profile/dynamics", access, "{\"labels\":[\"deep_connection\"]}");
		putJson("/api/v1/me/profile/bio", access, "{\"bio\":\"Hi\"}");
		assertThat(postJsonAuth("/api/v1/me/onboarding/complete", access, "{}").statusCode()).isEqualTo(200);
		return access;
	}

	private HttpResponse<String> getAuth(String path, String bearer) throws Exception {
		HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).GET()
				.header("Authorization", "Bearer " + bearer).build();
		return client.send(request, HttpResponse.BodyHandlers.ofString());
	}

	private HttpResponse<String> postJson(String path, String json) throws Exception {
		HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
				.header("Content-Type", "application/json")
				.POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8)).build();
		return client.send(request, HttpResponse.BodyHandlers.ofString());
	}

	private HttpResponse<String> postJsonAuth(String path, String bearer, String json) throws Exception {
		HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
				.header("Content-Type", "application/json").header("Authorization", "Bearer " + bearer)
				.POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8)).build();
		return client.send(request, HttpResponse.BodyHandlers.ofString());
	}

	private void putJson(String path, String bearer, String json) throws Exception {
		HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
				.header("Content-Type", "application/json").header("Authorization", "Bearer " + bearer)
				.PUT(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8)).build();
		assertThat(client.send(request, HttpResponse.BodyHandlers.ofString()).statusCode()).isEqualTo(200);
	}

	private static String extractJsonString(String body, String key) {
		String needle = "\"" + key + "\":\"";
		int i = body.indexOf(needle);
		if (i < 0) {
			throw new IllegalArgumentException("missing " + key);
		}
		int start = i + needle.length();
		int end = body.indexOf('"', start);
		return body.substring(start, end);
	}
}
