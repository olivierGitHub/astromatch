package com.astromatch.api.safety;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.astromatch.api.common.api.ApiEnvelope;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/operator")
public class OperatorController {

	private static final String OPERATOR_HEADER = "X-Operator-Key";

	private final OperatorAuthService operatorAuthService;
	private final SafetyService safetyService;

	public OperatorController(OperatorAuthService operatorAuthService, SafetyService safetyService) {
		this.operatorAuthService = operatorAuthService;
		this.safetyService = safetyService;
	}

	@GetMapping("/reports")
	public ResponseEntity<ApiEnvelope<List<SafetyDtos.OperatorReportDto>>> listReports(
			@RequestHeader(value = OPERATOR_HEADER, required = false) String operatorKey) {
		operatorAuthService.requireValidKey(operatorKey);
		return ResponseEntity.ok(ApiEnvelope.success(safetyService.listReportsForOperator()));
	}

	@PostMapping("/reports/{reportId}/resolve")
	public ResponseEntity<ApiEnvelope<Void>> resolve(@RequestHeader(value = OPERATOR_HEADER, required = false) String operatorKey,
			@PathVariable UUID reportId, @Valid @RequestBody SafetyDtos.OperatorResolveRequest body) {
		operatorAuthService.requireValidKey(operatorKey);
		safetyService.resolveReport(reportId, body.action(), body.note(), "operator-api");
		return ResponseEntity.ok(ApiEnvelope.success(null));
	}
}
