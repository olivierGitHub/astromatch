package com.astromatch.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SafetyIT {

	@LocalServerPort
	private int port;

	private final HttpClient client = HttpClient.newHttpClient();

	private static final String OP_KEY = "dev-only-operator-key-change-in-production";

	@Test
	void reportBlockAndOperatorResolve() throws Exception {
		String accessA = onboard("safety_it_a@example.com");
		String accessB = onboard("safety_it_b@example.com");
		String idB = extractJsonString(getAuth("/api/v1/auth/me", accessB).body(), "userId");
		String idA = extractJsonString(getAuth("/api/v1/auth/me", accessA).body(), "userId");

		var report = postJsonAuth("/api/v1/safety/report", accessA,
				"{\"reportedUserId\":\"" + idB + "\",\"context\":\"FEED\",\"reasonCode\":\"HARASSMENT\",\"detail\":\"test\"}");
		assertThat(report.statusCode()).isEqualTo(200);
		assertThat(report.body()).contains("\"reportId\"");

		var block = postJsonAuth("/api/v1/safety/block", accessA,
				"{\"blockedUserId\":\"" + idB + "\"}");
		assertThat(block.statusCode()).isEqualTo(200);

		var feed = getAuth("/api/v1/feed/candidates", accessA);
		assertThat(feed.body()).doesNotContain(idB);

		var opList = getOperator("/api/v1/operator/reports");
		assertThat(opList.statusCode()).isEqualTo(200);
		assertThat(opList.body()).contains(idB);

		String reportId = extractJsonString(opList.body(), "id");
		var resolve = postJsonOperator("/api/v1/operator/reports/" + reportId + "/resolve",
				"{\"action\":\"DISMISS\",\"note\":\"ok\"}");
		assertThat(resolve.statusCode()).isEqualTo(200);
	}

	@Test
	void blockPreventsMessagingWhenMatchExists() throws Exception {
		String accessA = onboard("safety_msg_a@example.com");
		String accessB = onboard("safety_msg_b@example.com");
		String idB = extractJsonString(getAuth("/api/v1/auth/me", accessB).body(), "userId");
		String idA = extractJsonString(getAuth("/api/v1/auth/me", accessA).body(), "userId");

		postJsonAuth("/api/v1/feed/swipe", accessA, "{\"targetUserId\":\"" + idB + "\",\"action\":\"LIKE\"}");
		var swipeB = postJsonAuth("/api/v1/feed/swipe", accessB,
				"{\"targetUserId\":\"" + idA + "\",\"action\":\"LIKE\"}");
		String matchId = extractJsonString(swipeB.body(), "matchId");

		assertThat(postJsonAuth("/api/v1/safety/block", accessA, "{\"blockedUserId\":\"" + idB + "\"}").statusCode())
				.isEqualTo(200);

		var msg = postJsonAuth("/api/v1/matches/" + matchId + "/messages", accessA, "{\"body\":\"nope\"}");
		assertThat(msg.statusCode()).isEqualTo(403);
		assertThat(msg.body()).contains("BLOCKED_USER");
	}

	@Test
	void operatorRejectsBadKey() throws Exception {
		var req = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/v1/operator/reports")).GET()
				.header("X-Operator-Key", "wrong").build();
		var res = client.send(req, HttpResponse.BodyHandlers.ofString());
		assertThat(res.statusCode()).isEqualTo(401);
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

	private HttpResponse<String> getOperator(String path) throws Exception {
		HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).GET()
				.header("X-Operator-Key", OP_KEY).build();
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

	private HttpResponse<String> postJsonOperator(String path, String json) throws Exception {
		HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
				.header("Content-Type", "application/json").header("X-Operator-Key", OP_KEY)
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
			throw new IllegalArgumentException("missing " + key + " in " + body);
		}
		int start = i + needle.length();
		int end = body.indexOf('"', start);
		return body.substring(start, end);
	}
}
