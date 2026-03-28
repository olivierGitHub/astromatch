package com.astromatch.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class MinAgeAndAccountIT {

	@LocalServerPort
	private int port;

	private final HttpClient client = HttpClient.newHttpClient();

	@Test
	void underageRegistrationReturns403() throws Exception {
		LocalDate young = LocalDate.now().minusYears(17).minusMonths(1);
		String body = String.format(
				"{\"email\":\"young@example.com\",\"password\":\"password12\",\"birthDate\":\"%s\"}",
				young);
		var response = postJson("/api/v1/auth/register", body);
		assertThat(response.statusCode()).isEqualTo(403);
		assertThat(response.body()).contains("AGE_REQUIREMENT_NOT_MET");
	}

	@Test
	void deleteAccountRemovesUserAndTokens() throws Exception {
		String email = "delete-me@example.com";
		String password = "password12";
		var reg = postJson("/api/v1/auth/register",
				"{\"email\":\"" + email + "\",\"password\":\"" + password + "\",\"birthDate\":\"1988-01-01\"}");
		assertThat(reg.statusCode()).isEqualTo(201);

		var login = postJson("/api/v1/auth/login",
				"{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}");
		assertThat(login.statusCode()).isEqualTo(200);
		String access = extractJsonString(login.body(), "accessToken");

		var delNoAuth = deleteAccount(null);
		assertThat(delNoAuth.statusCode()).isEqualTo(401);

		var del = deleteAccount(access);
		assertThat(del.statusCode()).isEqualTo(200);

		var loginAfter = postJson("/api/v1/auth/login",
				"{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}");
		assertThat(loginAfter.statusCode()).isEqualTo(401);

		var reRegister = postJson("/api/v1/auth/register",
				"{\"email\":\"" + email + "\",\"password\":\"" + password + "\",\"birthDate\":\"1988-01-01\"}");
		assertThat(reRegister.statusCode()).isEqualTo(201);
	}

	private HttpResponse<String> postJson(String path, String json) throws Exception {
		HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
				.header("Content-Type", "application/json")
				.POST(HttpRequest.BodyPublishers.ofString(json, StandardCharsets.UTF_8))
				.build();
		return client.send(request, HttpResponse.BodyHandlers.ofString());
	}

	private HttpResponse<String> deleteAccount(String bearerAccess) throws Exception {
		var builder = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/v1/account")).DELETE();
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
}
