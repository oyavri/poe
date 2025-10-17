# Poe - AI Call Assistant Platform

The project is developed for the technical case study of backend developer role at Teknasyon. The aim of the project is to create a (simulation of -- transcription is exempt from the scope of the technical case) an AI-powered phone assistant platform. Using this platform, users can record their phone calls and have them automatically transcribed by AI.

The name is inspired by the receptionist in the Raven Hotel in Altered Carbon. Which is also a reference to Edgar Allan Poe.

## How to run the project

! TODO

## Case requirements:

### Call Management:
- [ ] Must be able to create a new call. 
  - Title (e.g. "Client Meeting")
  - Duration
  - Participants

- [ ] Must be able to list calls.

- [ ] Must be able to view call details.

- [ ] Must be able to delete a call.

### Transcription Service:

- [ ] Transcription should start automatically when a call is created.
- [ ] The process must be asynchronous (run in the background).
- [ ] There must be status tracking: pending -> processing -> completed/failed.
- [ ] The transcription text will be simulated (no real AI service).
  - Simple simulation: 2-10 seconds delay + random text generation.
  - 5% error simulation (for testing and the retry mechanism).

### Endpoints:

- POST /auth/register
- POST /auth/login
- GET  /auth/me
- POST /calls -> Create a new call
- GET /calls -> List calls
- GET /calls/:id -> Get details
- DELETE /calls/:id -> Delete
- GET /calls/:id/transcription -> Get transcription status/result
