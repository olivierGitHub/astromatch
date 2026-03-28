package com.astromatch.api.safety;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.astromatch.api.config.SafetyProperties;
import com.astromatch.api.config.SlidingWindowRateLimiter;
import com.astromatch.api.identity.AccountStatus;
import com.astromatch.api.identity.RateLimitExceededException;
import com.astromatch.api.identity.User;
import com.astromatch.api.identity.UserRepository;
import com.astromatch.api.profile.ProfileRequestException;

@Service
public class SafetyService {

	private static final long REPORT_WINDOW_MS = 3_600_000L;
	private static final long BLOCK_WINDOW_MS = 86_400_000L;

	private final UserRepository userRepository;
	private final UserBlockRepository userBlockRepository;
	private final UserReportRepository userReportRepository;
	private final ModerationAuditRepository moderationAuditRepository;
	private final SlidingWindowRateLimiter limiter;
	private final SafetyProperties safetyProperties;

	public SafetyService(UserRepository userRepository, UserBlockRepository userBlockRepository,
			UserReportRepository userReportRepository, ModerationAuditRepository moderationAuditRepository,
			SlidingWindowRateLimiter limiter, SafetyProperties safetyProperties) {
		this.userRepository = userRepository;
		this.userBlockRepository = userBlockRepository;
		this.userReportRepository = userReportRepository;
		this.moderationAuditRepository = moderationAuditRepository;
		this.limiter = limiter;
		this.safetyProperties = safetyProperties;
	}

	@Transactional
	public SafetyDtos.ReportSubmittedDto submitReport(UUID reporterId, SafetyDtos.ReportRequest req) {
		String burstKey = "report:" + reporterId;
		if (!limiter.allow(burstKey, safetyProperties.getReportMaxPerHourPerUser(), REPORT_WINDOW_MS)) {
			throw new RateLimitExceededException();
		}
		if (req.reportedUserId().equals(reporterId)) {
			throw new ProfileRequestException("Cannot report yourself");
		}
		User reported = userRepository.findById(req.reportedUserId())
				.orElseThrow(() -> new ProfileRequestException("User not found"));
		if (!reported.isOnboardingCompleted()) {
			throw new ProfileRequestException("Invalid report target");
		}
		UserReport row = new UserReport();
		row.setReporterId(reporterId);
		row.setReportedUserId(req.reportedUserId());
		row.setContextType(req.context().name());
		row.setReasonCode(req.reasonCode());
		row.setDetail(req.detail());
		userReportRepository.save(row);
		return new SafetyDtos.ReportSubmittedDto(row.getId().toString());
	}

	@Transactional
	public void blockUser(UUID blockerId, UUID blockedUserId) {
		String burstKey = "block:" + blockerId;
		if (!limiter.allow(burstKey, safetyProperties.getBlockMaxPerDayPerUser(), BLOCK_WINDOW_MS)) {
			throw new RateLimitExceededException();
		}
		if (blockedUserId.equals(blockerId)) {
			throw new ProfileRequestException("Invalid block target");
		}
		if (!userRepository.existsById(blockedUserId)) {
			throw new ProfileRequestException("User not found");
		}
		if (userBlockRepository.existsByIdBlockerIdAndIdBlockedUserId(blockerId, blockedUserId)) {
			return;
		}
		UserBlock b = new UserBlock();
		b.setId(new UserBlockId(blockerId, blockedUserId));
		userBlockRepository.save(b);
	}

	@Transactional
	public void unblockUser(UUID blockerId, UUID blockedUserId) {
		userBlockRepository.deleteById(new UserBlockId(blockerId, blockedUserId));
	}

	@Transactional(readOnly = true)
	public SafetyDtos.BlockListDto listBlocked(UUID blockerId) {
		List<UUID> ids = userBlockRepository.findByIdBlockerIdOrderByCreatedAtDesc(blockerId).stream()
				.map(ub -> ub.getId().getBlockedUserId())
				.collect(Collectors.toCollection(ArrayList::new));
		return new SafetyDtos.BlockListDto(ids);
	}

	public boolean isBlockedEitherDirection(UUID a, UUID b) {
		return userBlockRepository.existsEitherDirection(a, b);
	}

	@Transactional(readOnly = true)
	public List<SafetyDtos.OperatorReportDto> listReportsForOperator() {
		return userReportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.OPEN).stream()
				.map(r -> new SafetyDtos.OperatorReportDto(r.getId().toString(), r.getReporterId().toString(),
						r.getReportedUserId().toString(), r.getContextType(), r.getReasonCode(),
						r.getDetail() != null ? r.getDetail() : "", r.getStatus().name(), r.getCreatedAt().toString()))
				.toList();
	}

	@Transactional
	public void resolveReport(UUID reportId, ModerationAction action, String note, String actorLabel) {
		UserReport r = userReportRepository.findById(reportId)
				.orElseThrow(() -> new ProfileRequestException("Report not found"));
		if (r.getStatus() == ReportStatus.RESOLVED) {
			throw new ProfileRequestException("Report already resolved");
		}
		User target = userRepository.findById(r.getReportedUserId())
				.orElseThrow(() -> new ProfileRequestException("Reported user not found"));
		r.setStatus(ReportStatus.RESOLVED);
		r.setResolvedAt(Instant.now());
		r.setResolutionNote(note);
		userReportRepository.save(r);

		ModerationAudit audit = new ModerationAudit();
		audit.setReportId(reportId);
		audit.setActorLabel(actorLabel);
		audit.setAction(action.name());
		audit.setTargetUserId(target.getId());
		audit.setDetail(note);

		switch (action) {
			case DISMISS -> { /* no account change */ }
			case WARN -> target.setAccountStatus(AccountStatus.WARNED);
			case SUSPEND -> target.setAccountStatus(AccountStatus.SUSPENDED);
			case BAN -> target.setAccountStatus(AccountStatus.BANNED);
		}
		if (action != ModerationAction.DISMISS) {
			userRepository.save(target);
		}
		moderationAuditRepository.save(audit);
	}
}
