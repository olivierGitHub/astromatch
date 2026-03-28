CREATE TABLE swipe_events (
    id UUID NOT NULL PRIMARY KEY,
    viewer_id UUID NOT NULL,
    target_user_id UUID NOT NULL,
    action VARCHAR(32) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_swipe_viewer FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_swipe_target FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_swipe_viewer_target UNIQUE (viewer_id, target_user_id)
);

CREATE INDEX idx_swipe_viewer_created ON swipe_events(viewer_id, created_at);
