CREATE TABLE user_consents (
    user_id UUID NOT NULL,
    consent_key VARCHAR(64) NOT NULL,
    granted BOOLEAN NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (user_id, consent_key),
    CONSTRAINT fk_user_consents_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
