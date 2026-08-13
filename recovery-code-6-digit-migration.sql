-- Star Follower — Six-digit recovery code migration
-- Run this once in Supabase for an existing database.

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_recovery_code_10_digits;
ALTER TABLE users
  DROP CONSTRAINT IF EXISTS users_recovery_code_6_digits;

ALTER TABLE users
  ALTER COLUMN recovery_code SET DEFAULT floor(random() * 900000 + 100000)::BIGINT::TEXT;

UPDATE users
SET recovery_code = floor(random() * 900000 + 100000)::BIGINT::TEXT
WHERE recovery_code !~ '^[0-9]{6}$';

ALTER TABLE users
  ADD CONSTRAINT users_recovery_code_6_digits
  CHECK (recovery_code ~ '^[0-9]{6}$');