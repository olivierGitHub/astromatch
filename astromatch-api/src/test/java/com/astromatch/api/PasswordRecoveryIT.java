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
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
		"astromatch.recovery.expose-reset-token=true",
		"astromatch.recovery.forgot-password-cooldown-seconds=1",
})
class PasswordRecoveryIT {

	@LocalServerPort
	private int port;

	private final HttpClient client = HttpClient.newHttpClient();

	@Test
	void forgotResetLoginAndRateLimit() throws Exception {
		String email = "recovery@example.com";
		String oldPassword = "password12";
		String newPassword = "newpassword12";

		var reg = postJson("/api/v1/auth/register",
				"{\"email\":\"" + email + "\",\"password\":\"" + oldPassword + "\",\"birthDate\":\"1991-04-10\"}");
		assertThat(reg.statusCode()).isEqualTo(201);

		var forgot1 = postJson("/api/v1/auth/forgot-password", "{\"email\":\"" + email + "\"}");
		assertThat(forgot1.statusCode()).isEqualTo(200);
		assertThat(forgot1.body()).contains("\"sent\":true");
		String resetToken = extractJsonString(forgot1.body(), "resetToken");

		var forgotTooSoon = postJson("/api/v1/auth/forgot-password", "{\"email\":\"" + email + "\"}");
		assertThat(forgotTooSoon.statusCode()).isEqualTo(429);

		Thread.sleep(1100);

		var forgot2 = postJson("/api/v1/auth/forgot-password", "{\"email\":\"" + email + "\"}");
		assertThat(forgot2.statusCode()).isEqualTo(200);
		String resetToken2 = extractJsonString(forgot2.body(), "resetToken");

		var reset = postJson("/api/v1/auth/reset-password",
				"{\"token\":\"" + escapeJson(resetToken2) + "\",\"newPassword\":\"" + newPassword + "\"}");
		assertThat(reset.statusCode()).isEqualTo(200);

		var loginOld = postJson("/api/v1/auth/login",
				"{\"email\":\"" + email + "\",\"password\":\"" + oldPassword + "\"}");
		assertThat(loginOld.statusCode()).isEqualTo(401);

		var loginNew = postJson("/api/v1/auth/login",
				"{\"email\":\"" + email + "\",\"password\":\"" + newPassword + "\"}");
		assertThat(loginNew.statusCode()).isEqualTo(200);

		var badReset = postJson("/api/v1/auth/reset-password",
				"{\"token\":\"" + escapeJson(resetToken) + "\",\"newPassword\":\"anotherpass12\"}");
		assertThat(badReset.statusCode()).isEqualTo(401);
	}

	private HttpResponse<String> postJson(String path, String json) throws Exception {
		HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
				.header("Content-Type", "application/json")
				.POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
				.build();
		return client.send(request, HttpResponse.BodyHandlers.ofString());
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
