ALTER TABLE users ADD COLUMN bonus_swipe_balance INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN alignment_boost_until TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN location_pass_until TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN location_pass_label VARCHAR(512) NULL;

CREATE TABLE billing_transactions (
    id UUID NOT NULL PRIMARY KEY,
    user_id UUID NOT NULL,
    platform VARCHAR(16) NOT NULL,
    product_id VARCHAR(128) NOT NULL,
    store_transaction_id VARCHAR(256) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT uq_billing_tx_store UNIQUE (store_transaction_id),
    CONSTRAINT fk_billing_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_billing_user_created ON billing_transactions(user_id, created_at);
