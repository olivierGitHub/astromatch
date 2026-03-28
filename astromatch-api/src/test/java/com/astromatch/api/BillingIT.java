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

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT, properties = {
		"astromatch.feed.daily-like-cap=1" })
class BillingIT {

	@LocalServerPort
	private int port;

	private final HttpClient client = HttpClient.newHttpClient();

	@Test
	void purchaseSwipePackGrantsBonusLikes() throws Exception {
		String access = onboard("billing_swipe@example.com");
		onboard("billing_target1@example.com");
		onboard("billing_target2@example.com");

		var purchase = postJsonAuth("/api/v1/billing/purchase/validate", access,
				"{\"platform\":\"ios\",\"productId\":\"com.astromatch.swipe_pack\","
						+ "\"receiptData\":\"stub-receipt-12345678\",\"transactionId\":\"tx-swipe-1\"}");
		assertThat(purchase.statusCode()).isEqualTo(200);

		var q = getAuth("/api/v1/feed/quota", access);
		assertThat(q.statusCode()).isEqualTo(200);
		assertThat(q.body()).contains("\"bonusLikeCredits\":5");

		String id1 = firstCandidateId(getAuth("/api/v1/feed/candidates", access).body());
		assertThat(swipe(access, id1, "LIKE").statusCode()).isEqualTo(200);
		String id2 = firstCandidateId(getAuth("/api/v1/feed/candidates", access).body());
		var secondLike = swipe(access, id2, "LIKE");
		assertThat(secondLike.statusCode()).isEqualTo(200);
		assertThat(secondLike.body()).contains("\"bonusLikeCreditsRemaining\":4");
	}

	@Test
	void duplicateTransactionIdIsIdempotent() throws Exception {
		String access = onboard("billing_idem@example.com");
		String body = "{\"platform\":\"android\",\"productId\":\"com.astromatch.swipe_pack\","
				+ "\"receiptData\":\"stub-receipt-12345678\",\"transactionId\":\"same-tx\"}";
		assertThat(postJsonAuth("/api/v1/billing/purchase/validate", access, body).statusCode()).isEqualTo(200);
		assertThat(postJsonAuth("/api/v1/billing/purchase/validate", access, body).statusCode()).isEqualTo(200);
		var q = getAuth("/api/v1/feed/quota", access);
		assertThat(q.body()).contains("\"bonusLikeCredits\":5");
	}

	private static String firstCandidateId(String feedBody) {
		int i = feedBody.indexOf("\"userId\":\"");
		if (i < 0) {
			throw new IllegalArgumentException("no candidate");
		}
		int start = i + "\"userId\":\"".length();
		int end = feedBody.indexOf('"', start);
		return feedBody.substring(start, end);
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
