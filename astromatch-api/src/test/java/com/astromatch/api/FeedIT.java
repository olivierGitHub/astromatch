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

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class FeedIT {

	private static final Pattern UUID_IN_JSON = Pattern
			.compile("\"userId\"\\s*:\\s*\"([0-9a-fA-F-]{36})\"");

	@LocalServerPort
	private int port;

	private final HttpClient client = HttpClient.newHttpClient();

	@Test
	void feedReturnsOnboardedCandidatesWithoutScoreField() throws Exception {
		String accessA = onboardUser("feed_a@example.com");
		String accessB = onboardUser("feed_b@example.com");

		var feed = getAuth("/api/v1/feed/candidates", accessA);
		assertThat(feed.statusCode()).isEqualTo(200);
		String body = feed.body();
		assertThat(body.toLowerCase()).doesNotContain("score");
		assertThat(body).contains("\"candidates\"");
		String bId = extractJsonString(getAuth("/api/v1/auth/me", accessB).body(), "userId");
		assertThat(body).contains(bId);
	}

	@Test
	void passSwipeRemovesCandidateFromFeed() throws Exception {
		String accessA = onboardUser("feed_pass_a@example.com");
		onboardUser("feed_pass_b@example.com");

		var feed1 = getAuth("/api/v1/feed/candidates", accessA);
		assertThat(feed1.statusCode()).isEqualTo(200);
		List<String> ids = candidateUserIds(feed1.body());
		assertThat(ids).isNotEmpty();
		String target = ids.get(0);

		var swipe = postJsonAuth("/api/v1/feed/swipe", accessA,
				"{\"targetUserId\":\"" + target + "\",\"action\":\"PASS\"}");
		assertThat(swipe.statusCode()).isEqualTo(200);
		assertThat(swipe.body()).contains("remainingLikesToday");

		var feed2 = getAuth("/api/v1/feed/candidates", accessA);
		assertThat(feed2.body()).doesNotContain("\"" + target + "\"");
	}

	private String onboardUser(String email) throws Exception {
		String password = "password12";
		var reg = postJson("/api/v1/auth/register", "{\"email\":\"" + email + "\",\"password\":\"" + password
				+ "\",\"birthDate\":\"1992-05-05\"}");
		assertThat(reg.statusCode()).isEqualTo(201);

		var login = postJson("/api/v1/auth/login",
				"{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}");
		assertThat(login.statusCode()).isEqualTo(200);
		String access = extractJsonString(login.body(), "accessToken");

		putJson("/api/v1/me/consents", access, "{\"privacy_ack\":true,\"notifications\":false,\"analytics\":false}");
		putJson("/api/v1/me/profile/birth", access,
				"{\"birthTimeUnknown\":true,\"birthTime\":null,\"birthPlaceLabel\":\"Paris, France\","
						+ "\"birthPlaceLat\":48.85,\"birthPlaceLng\":2.35,\"birthTimezone\":\"Europe/Paris\"}");
		putJson("/api/v1/me/profile/location", access,
				"{\"label\":\"Lyon, France\",\"lat\":45.76,\"lng\":4.83,\"manual\":true}");
		putJson("/api/v1/me/profile/dynamics", access, "{\"labels\":[\"deep_connection\"]}");
		putJson("/api/v1/me/profile/bio", access, "{\"bio\":\"Hi\"}");
		var complete = postJsonAuth("/api/v1/me/onboarding/complete", access, "{}");
		assertThat(complete.statusCode()).isEqualTo(200);
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
		var res = client.send(request, HttpResponse.BodyHandlers.ofString());
		assertThat(res.statusCode()).as(path).isEqualTo(200);
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
