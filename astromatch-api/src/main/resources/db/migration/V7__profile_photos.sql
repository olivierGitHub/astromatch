CREATE TABLE profile_photos (
    id UUID NOT NULL PRIMARY KEY,
    user_id UUID NOT NULL,
    sort_order INT NOT NULL,
    storage_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_profile_photos_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_profile_photos_user ON profile_photos (user_id);
