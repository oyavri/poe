DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transcription_status') THEN
        CREATE TYPE transcription_status AS ENUM ('pending', 'processing', 'completed', 'failed');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    duration INT NOT NULL, 
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL,
    active BOOLEAN NOT NULL,
    CONSTRAINT fk_call_user FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS participants (
    call_id UUID NOT NULL,
    user_id UUID NOT NULL,
    PRIMARY KEY (call_id, user_id),
    CONSTRAINT fk_participants_call FOREIGN KEY (call_id) REFERENCES calls(id),
    CONSTRAINT fk_participants_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transcriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID UNIQUE NOT NULL,
    status transcription_status NOT NULL,
    transcription TEXT,
    initiated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_transcription_call FOREIGN KEY (call_id) REFERENCES calls(id)
);
