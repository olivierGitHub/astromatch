CREATE TABLE mismatch_feedback_events (
    id UUID NOT NULL PRIMARY KEY,
    viewer_id UUID NOT NULL,
    target_user_id UUID NOT NULL,
    focus VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_mismatch_viewer FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_mismatch_target FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_mismatch_viewer_target ON mismatch_feedback_events(viewer_id, target_user_id);
CREATE INDEX idx_mismatch_viewer_created ON mismatch_feedback_events(viewer_id, created_at);
