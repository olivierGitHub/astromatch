ALTER TABLE match_messages ADD COLUMN kind VARCHAR(16) NOT NULL DEFAULT 'TEXT';
ALTER TABLE match_messages ADD COLUMN audio_storage_filename VARCHAR(512) NULL;
ALTER TABLE match_messages ADD COLUMN audio_content_type VARCHAR(128) NULL;
ALTER TABLE match_messages ADD COLUMN audio_duration_ms INT NULL;
