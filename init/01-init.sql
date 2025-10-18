DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transcription_status') THEN
        CREATE TYPE transcription_status AS ENUM ('pending', 'processing', 'completed', 'failed');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    fullname TEXT NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    passwordHash TEXT NOT NULL,
    salt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Call" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    duration NUMBER NOT NULL, 
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    createdBy UUID NOT NULL,
    active BOOLEAN NOT NULL,
    CONSTRAINT fk_call_user FOREIGN KEY (createdBy) REFERENCES "User"(id)
);

CREATE TABLE IF NOT EXISTS "Participants" (
    callId UUID NOT NULL,
    userId UUID NOT NULL,
    PRIMARY KEY (callId, userId),
    CONSTRAINT fk_participants_call FOREIGN KEY (callId) REFERENCES "Call"(id),
    CONSTRAINT fk_participants_user FOREIGN KEY (userId) REFERENCES "User"(id)
);

CREATE TABLE IF NOT EXISTS "Transcription" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    callId UUID UNIQUE NOT NULL,
    status transcription_status NOT NULL,
    transcription TEXT,
    initiatedAt TIMESTAMP NOT NULL,
    CONSTRAINT fk_transcription_call FOREIGN KEY (callId) REFERENCES "Call"(id)
);
