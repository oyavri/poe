# Poe - AI Call Assistant Platform

The project is developed for the technical case study of backend developer role at Teknasyon. The aim of the project is to create a (simulation of -- transcription is exempt from the scope of the technical case) an AI-powered phone assistant platform. Using this platform, users can record their phone calls and have them automatically transcribed by AI.

The name is inspired by the receptionist in the Raven Hotel in Altered Carbon. Which is also a reference to Edgar Allan Poe.

## How to run the project

Project is fully dockerized, thus, if you have Docker and are able to run docker compose, running following command in the project directory (where docker-compose.yaml is) will start the whole project:

```bash
$ docker compose up --build -d
```

To stop the project, following command can be used:

```bash
$ docker compose down
```

## Remarks & Notes:
 
It was a nice challenge to test my skills, even though I am familiar with the concepts (how authentication should be, how the flow should be etc.) it was my first time implementing them. It has been a long time since I used Node.js (or JavaScript) and to be honest, it does not seem like an idiomatic JavaScript implementation. It would be nicer if I have chosen TypeScript but I was not sure if it was allowed or not. 

It would probably be easier if I were to use NestJS as it already provides boilerplate for me and improves development experience. However, since I had limited time and was not going to spend much of it to learn the framework, I chose Express.js. Moreover, at the beginning, I was trying to use an ORM (for the first time again) and was not very happy with it (setting up Prisma took more than I expected) so the queries are hard coded and I have mixed feelings about it. Also, as I chose the technology stack on my familiarity, I used PostgreSQL because I have previously worked with it (+ it is RDBMS which is also what I'm familiar with).

After grasping the requirements and designing how it should be, LLMs have been helpful for me to find my way out through the development. Along the way of design, I had to make some assumptions. 
- A new call requires a duration field. But a duration can only be determined after a call is ended, thus, the generated "call" is actually a "recording" that is ready to be processed by the transcription service. Also, we are not doing a real-time transcription so it is a post-processing job. The audio of calls is stored in a place like a CDN. I would store the link to the CDN media in the DB but I did not try to generate a URL for that purpose, thus there is no field for that in DB.

There are several problems unsolved that I realized before the implementation and during implementation. 
- As I mentioned in the callService.js, the system is not fault-tolerant. When a call is created, it is both written to the database (DB) and sent to the message queue (MQ). My implementation does not do this atomically, so it is not fault-tolerant and this may lead to inconsistencies if any of DB or MQ is down. I was aware of outbox pattern but since I haven't used it before, I was not sure if I were to handle the complexity it would bring. Thus, I implemented the project in a faulty way. (ChatGPT has also suggested outbox pattern.)

- I am not sure if the tasks in the queue is persistent (I believe it requires the Redis setup to be configured with a flag, even though I have configured it as append only file, I am not sure since I haven't tested it. Also, it is not mapped to my file system so it lives in the container.). Thus, this is another issue my project has. My implementation depends on MQ's retry mechanism, however, it feels like it should live in DB or somewhere else. If Redis that the BullMQ depend on can be persistent, it is not a problem.

- Depending on the previous statement, even if Redis is persistent, I am not sure what happens if a worker dies in the middle of the job. As BullMQ will not hear from it, the job will be locked (BullMQ locks the job if it is being processed by a worker) and will wait for the delay. 

- If a call gets deleted when it is being processed by the worker, worker is not aware of it. Thus, it will try to complete the processing. 

## Future Improvements:

- It would be nicer to have unit tests of it. Implementing the project took more than I expected. 
- Outbox pattern for fault tolerance & consistency.
- Better structuring for workers can be done. I don't like current version of it.
- Cache utilization is suggested for the project. If Redis is not for BullMQ, then a caching mechanism can be implemented. Caching for frequently accessed transcriptions can be done.
- Current implementation creates a new call with owner alongside with it and only owner can check the transcription test and transcription status. This means more than one user can ask for transcription of the same call by being an owner of a duplicate call (with different call id) entry. Asking for transcription more than once means wasted resources. It can be implemented in a way that all users access the same transcription of the same call. 
- CDN for the media can be integrated to the project. Current setup does not have any spot for CDN links to live.
- Given optional additions can be implemented in the future, currently, only transcription retry is implemented (but might be inconsistent as I mentioned in the Remarks & Notes section.) Optional additions are as follows: filtering, pagination, sorting, transcription retry (can be improved), analytics endpoints, and search functionality.
- Swagger documentation can be done to be more expressive about the API endpoints.
- Linter can be set up so that the code repository can be consistent (hopefully).
- TypeScript would be a huge improvement for developer experience... (I've suffered a lot from the runtime errors).
- Move domains to routers instead of stacking them in the program entry point (./src/server/app.js)
- Graceful shutdown for workers.
- Better logging, can be considered as analytics but still worth a mention.

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

#### POST /auth/register
Request:
```http 
POST /auth/register
Content-Type: application/json

{
    "email": "john.doe@example.org",
    "full_name": "John Doe",
    "password": "p4ssw0rd"
}
```
Response:
```http
HTTP 201 Created
Content-Type: application/json

{
    "user": {
        "id": "921166e3-a300-4ce3-8c58-48206ab78118",
        "email": "john.doe@example.org",
        "full_name": "John Doe",
        "created_at": "2025-10-20T11:20:29.642Z"
    }
}
```
---
#### POST /auth/login
Request:
```http 
POST /auth/login
Content-Type: application/json

{
    "email": "thomas.anderson@matrix.com",
    "password": "follow_the_white_rabbit"
}
```
Response:
```http
HTTP 200 OK
Content-Type: application/json

{
    "token": <your_jwt_token>,
    "user": {
        "id": "83d717c6-e774-4be1-8883-e2709d6c62c2",
        "email": "thomas.anderson@matrix.com",
        "full_name": "Thomas A. Anderson",
        "created_at": "2025-10-20T11:20:04.619Z"
    }
}
```
---
#### GET /auth/me
Response:
```http 
GET /auth/me
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
    "user": {
        "id": "83d717c6-e774-4be1-8883-e2709d6c62c2",
        "email": "thomas.anderson@matrix.com",
        "iat": 1760959788,
        "exp": 1761046188
    }
}
```
---
### POST /calls - Create new call
Request:
```http 
POST /calls
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
    "title": "Urgent meeting",
    "duration": 10000,
    "participants": [
        "83d717c6-e774-4be1-8883-e2709d6c62c2",
        "8fa3a9d2-649c-4130-80df-513f18f63253"
    ]
}
```
Response:
```
HTTP 201 Created
Content-Type: application/json

{
    "id": "b2011c8a-288b-4cba-9c1a-4563d001f18d",
    "title": "Urgent meeting",
    "duration": 10000,
    "created_by": "83d717c6-e774-4be1-8883-e2709d6c62c2"
}
```

---
### GET /calls - List the active calls the user have
Response:
```http 
GET /auth/me
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
    [
        {
            "id": "b2011c8a-288b-4cba-9c1a-4563d001f18d",
            "title": "Urgent meeting",
            "duration": 10000,
            "created_at": "2025-10-20T11:31:45.481Z",
            "created_by": "83d717c6-e774-4be1-8883-e2709d6c62c2",
            "participants": [
                "83d717c6-e774-4be1-8883-e2709d6c62c2",
                "8fa3a9d2-649c-4130-80df-513f18f63253"
            ]
        }
    ]
}
```
---
### GET /calls/:id - Get the details of the call with given ID
Response:
```http 
GET /calls/:id
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
    "id": "b2011c8a-288b-4cba-9c1a-4563d001f18d"
    "title": "Urgent meeting",
    "duration": 10000,
    "created_at": "2025-10-20T11:31:45.481Z",
    "created_by": "83d717c6-e774-4be1-8883-e2709d6c62c2",
    "participants": [
        "83d717c6-e774-4be1-8883-e2709d6c62c2",
        "8fa3a9d2-649c-4130-80df-513f18f63253"
    ]
}
```
---
### DELETE /calls/:id - Soft delete the call with given ID (deactivate the call)
Response:
```http 
DELETE /calls/:id
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
    "created_by": "83d717c6-e774-4be1-8883-e2709d6c62c2",
    "id": "39210d07-8591-4adb-b0d5-706632363220"
    "message": "Call deleted successfully."
}
```
---
### GET /calls/:id/transcription - Get transcription status/result of the call with given ID
Response (pending/processing/failed):
```http 
GET /calls/:id/transcription
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "id": "88283a30-8906-438d-8406-f1faf4020ef1",
  "callId"
  "status": "pending",
}
```
Response (completed):
```http 
GET /calls/:id/transcription
Content-Type: application/json
Authorization: Bearer <your_jwt_token>

{
  "id": "88283a30-8906-438d-8406-f1faf4020ef1",
  "status": "completed",
  "transcription": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam consectetur rutrum eleifend."
}
```
