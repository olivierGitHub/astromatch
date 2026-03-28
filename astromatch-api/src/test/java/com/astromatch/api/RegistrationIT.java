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
class RegistrationIT {

	static final String ADULT_BIRTH = "\"birthDate\":\"1990-06-15\"";

	@LocalServerPort
	private int port;

	private final HttpClient client = HttpClient.newHttpClient();

	@Test
	void registerReturns201AndEnvelope() throws Exception {
		String body = "{\"email\":\"newuser@example.com\",\"password\":\"password12\"," + ADULT_BIRTH + "}";
		var response = postRegister(body);
		assertThat(response.statusCode()).isEqualTo(201);
		assertThat(response.body()).contains("\"error\":null");
		assertThat(response.body()).contains("\"userId\"");
		assertThat(response.body()).contains("newuser@example.com");
	}

	@Test
	void duplicateEmailReturns409Envelope() throws Exception {
		String body = "{\"email\":\"dup@example.com\",\"password\":\"password12\"}";
		assertThat(postRegister(body).statusCode()).isEqualTo(201);
		var second = postRegister(body);
		assertThat(second.statusCode()).isEqualTo(409);
		assertThat(second.body()).contains("EMAIL_ALREADY_EXISTS");
		assertThat(second.body()).contains("\"traceId\"");
	}

	@Test
	void shortPasswordReturns400ValidationEnvelope() throws Exception {
		String body = "{\"email\":\"shortpw@example.com\",\"password\":\"short\"," + ADULT_BIRTH + "}";
		var response = postRegister(body);
		assertThat(response.statusCode()).isEqualTo(400);
		assertThat(response.body()).contains("VALIDATION_ERROR");
		assertThat(response.body()).contains("\"traceId\"");
	}

	private HttpResponse<String> postRegister(String jsonBody) throws Exception {
		HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/v1/auth/register"))
				.header("Content-Type", "application/json")
				.POST(HttpRequest.BodyPublishers.ofString(jsonBody, StandardCharsets.UTF_8))
				.build();
		return client.send(request, HttpResponse.BodyHandlers.ofString());
	}
}
