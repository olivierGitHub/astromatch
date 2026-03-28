CREATE TABLE user_blocks (
    blocker_id UUID NOT NULL,
    blocked_user_id UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    PRIMARY KEY (blocker_id, blocked_user_id),
    CONSTRAINT fk_user_blocks_blocker FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_blocks_blocked FOREIGN KEY (blocked_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_user_blocks_not_self CHECK (blocker_id <> blocked_user_id)
);

CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_user_id);

CREATE TABLE user_reports (
    id UUID NOT NULL PRIMARY KEY,
    reporter_id UUID NOT NULL,
    reported_user_id UUID NOT NULL,
    context_type VARCHAR(32) NOT NULL,
    reason_code VARCHAR(64) NOT NULL,
    detail VARCHAR(2000),
    status VARCHAR(16) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP,
    resolution_note VARCHAR(2000),
    CONSTRAINT fk_user_reports_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_reports_reported FOREIGN KEY (reported_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_user_reports_not_self CHECK (reporter_id <> reported_user_id)
);

CREATE INDEX idx_user_reports_open ON user_reports(status, created_at DESC);

CREATE TABLE moderation_audit (
    id UUID NOT NULL PRIMARY KEY,
    report_id UUID,
    actor_label VARCHAR(255) NOT NULL,
    action VARCHAR(32) NOT NULL,
    target_user_id UUID NOT NULL,
    detail VARCHAR(2000),
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_moderation_audit_report FOREIGN KEY (report_id) REFERENCES user_reports(id) ON DELETE SET NULL,
    CONSTRAINT fk_moderation_audit_target FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE users ADD COLUMN account_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE';
