CREATE TABLE matches (
    id UUID NOT NULL PRIMARY KEY,
    user_low UUID NOT NULL,
    user_high UUID NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_matches_low FOREIGN KEY (user_low) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_matches_high FOREIGN KEY (user_high) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_matches_pair UNIQUE (user_low, user_high)
);

CREATE INDEX idx_matches_low ON matches(user_low);
CREATE INDEX idx_matches_high ON matches(user_high);

CREATE TABLE match_messages (
    id UUID NOT NULL PRIMARY KEY,
    match_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    body VARCHAR(4000) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_mm_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    CONSTRAINT fk_mm_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_mm_match_created ON match_messages(match_id, created_at);

ALTER TABLE users ADD COLUMN expo_push_token VARCHAR(512) NULL;
