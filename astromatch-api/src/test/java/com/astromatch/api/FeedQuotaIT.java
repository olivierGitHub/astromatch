package com.astromatch.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
		"astromatch.feed.daily-like-cap=1" })
class FeedQuotaIT {

	private static final Pattern UUID_IN_JSON = Pattern
			.compile("\"userId\"\\s*:\\s*\"([0-9a-fA-F-]{36})\"");

	@LocalServerPort
	private int port;

	private final HttpClient client = HttpClient.newHttpClient();

	@Test
	void secondLikeSameDayReturnsQuotaError() throws Exception {
		String accessV = onboard("quota_v@example.com");
		onboard("quota_t1@example.com");
		onboard("quota_t2@example.com");

		var feed = getAuth("/api/v1/feed/candidates", accessV);
		List<String> ids = candidateUserIds(feed.body());
		assertThat(ids).hasSizeGreaterThanOrEqualTo(2);

		assertThat(swipe(accessV, ids.get(0), "LIKE").statusCode()).isEqualTo(200);
		var second = swipe(accessV, ids.get(1), "LIKE");
		assertThat(second.statusCode()).isEqualTo(403);
		assertThat(second.body()).contains("QUOTA_EXCEEDED");
		assertThat(second.body()).contains("traceId");
	}

	private HttpResponse<String> swipe(String access, String targetId, String action) throws Exception {
		return postJsonAuth("/api/v1/feed/swipe", access,
				"{\"targetUserId\":\"" + targetId + "\",\"action\":\"" + action + "\"}");
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

	private static List<String> candidateUserIds(String feedBody) {
		List<String> out = new ArrayList<>();
		Matcher m = UUID_IN_JSON.matcher(feedBody);
		while (m.find()) {
			out.add(m.group(1));
		}
		return out;
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
