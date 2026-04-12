package com.astromatch.api.match;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.astromatch.api.config.UploadProperties;
import com.astromatch.api.profile.ProfileRequestException;
import com.astromatch.api.safety.BlockedInteractionException;
import com.astromatch.api.safety.UserBlockRepository;

@Service
public class MatchMessagingService {

	private static final int MESSAGE_PAGE = 200;
	private static final int MAX_VOICE_DURATION_MS = 600_000;

	private final MatchMessageRepository matchMessageRepository;
	private final MatchService matchService;
	private final UserBlockRepository userBlockRepository;
	private final PushNotificationService pushNotificationService;
	private final UploadProperties uploadProperties;

	public MatchMessagingService(MatchMessageRepository matchMessageRepository, MatchService matchService,
			UserBlockRepository userBlockRepository, PushNotificationService pushNotificationService,
			UploadProperties uploadProperties) {
		this.matchMessageRepository = matchMessageRepository;
		this.matchService = matchService;
		this.userBlockRepository = userBlockRepository;
		this.pushNotificationService = pushNotificationService;
		this.uploadProperties = uploadProperties;
	}

	@Transactional(readOnly = true)
	public List<MatchDtos.MessageDto> listMessages(UUID userId, UUID matchId) {
		matchService.requireParticipant(matchId, userId);
		return matchMessageRepository
				.findByMatchIdOrderByCreatedAtAsc(matchId, PageRequest.of(0, MESSAGE_PAGE))
				.stream()
				.map(MatchMessagingService::toDto)
				.collect(Collectors.toList());
	}

	@Transactional
	public MatchDtos.MessageDto sendMessage(UUID userId, UUID matchId, String body) {
		String trimmed = body != null ? body.trim() : "";
		if (trimmed.isEmpty()) {
			throw new ProfileRequestException("Message body is required");
		}
		if (trimmed.length() > 4000) {
			throw new ProfileRequestException("Message too long");
		}
		Match m = matchService.requireParticipant(matchId, userId);
		assertNotBlocked(userId, m);
		MatchMessage msg = new MatchMessage();
		msg.setMatchId(matchId);
		msg.setSenderId(userId);
		msg.setKind(MessageKind.TEXT);
		msg.setBody(trimmed);
		matchMessageRepository.save(msg);

		UUID recipient = m.getUserLow().equals(userId) ? m.getUserHigh() : m.getUserLow();
		if (!recipient.equals(userId)) {
			pushNotificationService.notifyNewMessage(matchId, recipient, userId, trimmed);
		}
		return toDto(msg);
	}

	@Transactional
	public MatchDtos.MessageDto sendVoiceMessage(UUID userId, UUID matchId, MultipartFile file, Integer durationMs) {
		if (file == null || file.isEmpty()) {
			throw new ProfileRequestException("Audio file is required");
		}
		long maxBytes = uploadProperties.getMaxVoiceBytes();
		if (file.getSize() > maxBytes) {
			throw new ProfileRequestException("Voice message too large");
		}
		String rawCt = file.getContentType();
		String ct = rawCt != null && !rawCt.isBlank() ? rawCt.trim() : "application/octet-stream";
		if (!ct.toLowerCase().startsWith("audio/")) {
			throw new ProfileRequestException("Only audio uploads are allowed");
		}
		Match m = matchService.requireParticipant(matchId, userId);
		assertNotBlocked(userId, m);

		UUID id = UUID.randomUUID();
		String filename = "voice-" + id + storageSuffix(ct);
		Path dir = Path.of(uploadProperties.getDir());
		try {
			Files.createDirectories(dir);
			Path out = dir.resolve(filename);
			try (InputStream in = file.getInputStream()) {
				Files.copy(in, out, StandardCopyOption.REPLACE_EXISTING);
			}
		}
		catch (IOException e) {
			throw new ProfileRequestException("Could not store voice message");
		}

		int dur = durationMs == null ? 0 : durationMs;
		dur = Math.max(0, Math.min(dur, MAX_VOICE_DURATION_MS));

		MatchMessage msg = new MatchMessage();
		msg.setId(id);
		msg.setMatchId(matchId);
		msg.setSenderId(userId);
		msg.setKind(MessageKind.AUDIO);
		msg.setBody("");
		msg.setAudioStorageFilename(filename);
		msg.setAudioContentType(ct);
		msg.setAudioDurationMs(dur > 0 ? dur : null);
		// With a pre-assigned id Hibernate may merge without running @PrePersist; set timestamps explicitly.
		msg.setCreatedAt(Instant.now());
		matchMessageRepository.save(msg);

		UUID recipient = m.getUserLow().equals(userId) ? m.getUserHigh() : m.getUserLow();
		if (!recipient.equals(userId)) {
			pushNotificationService.notifyNewMessage(matchId, recipient, userId, "Message vocal");
		}
		return toDto(msg);
	}

	@Transactional
	public MatchDtos.MessageDto sendImageMessage(UUID userId, UUID matchId, MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new ProfileRequestException("Image file is required");
		}
		long maxBytes = uploadProperties.getMaxPhotoBytes();
		if (file.getSize() > maxBytes) {
			throw new ProfileRequestException("Image too large");
		}
		String rawCt = file.getContentType();
		String ct = rawCt != null && !rawCt.isBlank() ? rawCt.trim() : "application/octet-stream";
		if (!ct.toLowerCase().startsWith("image/")) {
			throw new ProfileRequestException("Only image uploads are allowed");
		}
		Match m = matchService.requireParticipant(matchId, userId);
		assertNotBlocked(userId, m);

		UUID id = UUID.randomUUID();
		String filename = "img-" + id + imageStorageSuffix(ct);
		Path dir = Path.of(uploadProperties.getDir());
		try {
			Files.createDirectories(dir);
			Path out = dir.resolve(filename);
			try (InputStream in = file.getInputStream()) {
				Files.copy(in, out, StandardCopyOption.REPLACE_EXISTING);
			}
		}
		catch (IOException e) {
			throw new ProfileRequestException("Could not store image");
		}

		MatchMessage msg = new MatchMessage();
		msg.setId(id);
		msg.setMatchId(matchId);
		msg.setSenderId(userId);
		msg.setKind(MessageKind.IMAGE);
		msg.setBody("");
		msg.setImageStorageFilename(filename);
		msg.setImageContentType(ct);
		msg.setCreatedAt(Instant.now());
		matchMessageRepository.save(msg);

		UUID recipient = m.getUserLow().equals(userId) ? m.getUserHigh() : m.getUserLow();
		if (!recipient.equals(userId)) {
			pushNotificationService.notifyNewMessage(matchId, recipient, userId, "Photo");
		}
		return toDto(msg);
	}

	@Transactional(readOnly = true)
	public byte[] readVoiceAttachment(UUID userId, UUID matchId, UUID messageId) throws IOException {
		Match m = matchService.requireParticipant(matchId, userId);
		assertNotBlocked(userId, m);
		MatchMessage msg = matchMessageRepository.findById(messageId).orElseThrow(() -> new ProfileRequestException("Not found"));
		if (!msg.getMatchId().equals(matchId) || msg.getKind() != MessageKind.AUDIO) {
			throw new ProfileRequestException("Not found");
		}
		String fn = msg.getAudioStorageFilename();
		if (fn == null || fn.isBlank()) {
			throw new ProfileRequestException("Not found");
		}
		Path path = Path.of(uploadProperties.getDir()).resolve(fn);
		if (!Files.isRegularFile(path)) {
			throw new ProfileRequestException("Not found");
		}
		return Files.readAllBytes(path);
	}

	@Transactional(readOnly = true)
	public String getVoiceContentType(UUID userId, UUID matchId, UUID messageId) {
		Match m = matchService.requireParticipant(matchId, userId);
		assertNotBlocked(userId, m);
		MatchMessage msg = matchMessageRepository.findById(messageId).orElseThrow(() -> new ProfileRequestException("Not found"));
		if (!msg.getMatchId().equals(matchId) || msg.getKind() != MessageKind.AUDIO) {
			throw new ProfileRequestException("Not found");
		}
		String ct = msg.getAudioContentType();
		return ct != null && !ct.isBlank() ? ct : "application/octet-stream";
	}

	@Transactional(readOnly = true)
	public byte[] readImageAttachment(UUID userId, UUID matchId, UUID messageId) throws IOException {
		Match m = matchService.requireParticipant(matchId, userId);
		assertNotBlocked(userId, m);
		MatchMessage msg = matchMessageRepository.findById(messageId).orElseThrow(() -> new ProfileRequestException("Not found"));
		if (!msg.getMatchId().equals(matchId) || msg.getKind() != MessageKind.IMAGE) {
			throw new ProfileRequestException("Not found");
		}
		String fn = msg.getImageStorageFilename();
		if (fn == null || fn.isBlank()) {
			throw new ProfileRequestException("Not found");
		}
		Path path = Path.of(uploadProperties.getDir()).resolve(fn);
		if (!Files.isRegularFile(path)) {
			throw new ProfileRequestException("Not found");
		}
		return Files.readAllBytes(path);
	}

	@Transactional(readOnly = true)
	public String getImageContentType(UUID userId, UUID matchId, UUID messageId) {
		Match m = matchService.requireParticipant(matchId, userId);
		assertNotBlocked(userId, m);
		MatchMessage msg = matchMessageRepository.findById(messageId).orElseThrow(() -> new ProfileRequestException("Not found"));
		if (!msg.getMatchId().equals(matchId) || msg.getKind() != MessageKind.IMAGE) {
			throw new ProfileRequestException("Not found");
		}
		String ct = msg.getImageContentType();
		return ct != null && !ct.isBlank() ? ct : "application/octet-stream";
	}

	private void assertNotBlocked(UUID userId, Match m) {
		UUID other = m.getUserLow().equals(userId) ? m.getUserHigh() : m.getUserLow();
		if (userBlockRepository.existsEitherDirection(userId, other)) {
			throw new BlockedInteractionException();
		}
	}

	private static String storageSuffix(String contentType) {
		String c = contentType.toLowerCase();
		if (c.contains("webm")) {
			return ".webm";
		}
		if (c.contains("mpeg") || c.contains("mp3")) {
			return ".mp3";
		}
		if (c.contains("mp4") || c.contains("m4a") || c.contains("aac")) {
			return ".m4a";
		}
		return ".bin";
	}

	private static String imageStorageSuffix(String contentType) {
		String c = contentType.toLowerCase();
		if (c.contains("png")) {
			return ".png";
		}
		if (c.contains("gif")) {
			return ".gif";
		}
		if (c.contains("webp")) {
			return ".webp";
		}
		if (c.contains("heic") || c.contains("heif")) {
			return ".heic";
		}
		if (c.contains("jpeg") || c.contains("jpg")) {
			return ".jpg";
		}
		return ".jpg";
	}

	private static MatchDtos.MessageDto toDto(MatchMessage m) {
		Instant created = m.getCreatedAt() != null ? m.getCreatedAt() : Instant.now();
		return new MatchDtos.MessageDto(m.getId().toString(), m.getSenderId().toString(),
				m.getBody() != null ? m.getBody() : "", created.toString(), m.getKind().name(),
				m.getAudioDurationMs());
	}
}
