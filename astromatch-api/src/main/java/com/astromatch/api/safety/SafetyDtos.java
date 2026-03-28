package com.astromatch.api.safety;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class SafetyDtos {

	private SafetyDtos() {
	}

	public enum ReportContext {
		FEED,
		CHAT,
		MATCH
	}

	public record ReportRequest(@NotNull java.util.UUID reportedUserId, @NotNull ReportContext context,
			@NotBlank @Size(max = 64) String reasonCode, @Size(max = 2000) String detail) {
	}

	public record ReportSubmittedDto(String reportId) {
	}

	public record BlockRequest(@NotNull java.util.UUID blockedUserId) {
	}

	public record BlockListDto(List<java.util.UUID> blockedUserIds) {
	}

	public record OperatorReportDto(String id, String reporterId, String reportedUserId, String contextType,
			String reasonCode, String detail, String status, String createdAt) {
	}

	public record OperatorResolveRequest(@NotNull ModerationAction action, @Size(max = 2000) String note) {
	}
}
