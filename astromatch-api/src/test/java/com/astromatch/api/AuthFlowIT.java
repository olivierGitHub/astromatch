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
class AuthFlowIT {

	@LocalServerPort
	private int port;

	private final HttpClient client = HttpClient.newHttpClient();

	@Test
	void registerLoginMeRefreshLogout() throws Exception {
		String email = "jwtflow@example.com";
		String password = "password12";

		var reg = postJson("/api/v1/auth/register",
				"{\"email\":\"" + email + "\",\"password\":\"" + password + "\",\"birthDate\":\"1990-03-20\"}");
		assertThat(reg.statusCode()).isEqualTo(201);

		var login = postJson("/api/v1/auth/login",
				"{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}");
		assertThat(login.statusCode()).isEqualTo(200);
		assertThat(login.body()).contains("\"accessToken\"");
		assertThat(login.body()).contains("\"refreshToken\"");
		String refresh = extractJsonString(login.body(), "refreshToken");
		String access = extractJsonString(login.body(), "accessToken");

		var meNoAuth = get("/api/v1/auth/me", null);
		assertThat(meNoAuth.statusCode()).isEqualTo(401);

		var me = get("/api/v1/auth/me", access);
		assertThat(me.statusCode()).isEqualTo(200);
		assertThat(me.body()).contains(email);

		var refreshRes = postJson("/api/v1/auth/refresh", "{\"refreshToken\":\"" + escapeJson(refresh) + "\"}");
		assertThat(refreshRes.statusCode()).isEqualTo(200);
		String newRefresh = extractJsonString(refreshRes.body(), "refreshToken");

		var logout = postJson("/api/v1/auth/logout", "{\"refreshToken\":\"" + escapeJson(newRefresh) + "\"}");
		assertThat(logout.statusCode()).isEqualTo(200);

		var badRefresh = postJson("/api/v1/auth/refresh", "{\"refreshToken\":\"" + escapeJson(newRefresh) + "\"}");
		assertThat(badRefresh.statusCode()).isEqualTo(401);
	}

	private HttpResponse<String> postJson(String path, String json) throws Exception {
		HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
				.header("Content-Type", "application/json")
				.POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
				.build();
		return client.send(request, HttpResponse.BodyHandlers.ofString());
	}

	private HttpResponse<String> get(String path, String bearerAccess) throws Exception {
		var builder = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path)).GET();
		if (bearerAccess != null) {
			builder = builder.header("Authorization", "Bearer " + bearerAccess);
		}
		return client.send(builder.build(), HttpResponse.BodyHandlers.ofString());
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

	private static String escapeJson(String s) {
		return s.replace("\\", "\\\\").replace("\"", "\\\"");
	}
}
