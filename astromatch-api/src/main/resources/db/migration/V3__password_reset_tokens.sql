CREATE TABLE password_reset_tokens (
    id UUID NOT NULL PRIMARY KEY,
    user_id UUID NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uq_password_reset_hash UNIQUE (token_hash)
);

CREATE INDEX idx_password_reset_user ON password_reset_tokens (user_id);
