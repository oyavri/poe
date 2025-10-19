# Poe - AI Call Assistant Platform

The project is developed for the technical case study of backend developer role at Teknasyon. The aim of the project is to create a (simulation of -- transcription is exempt from the scope of the technical case) an AI-powered phone assistant platform. Using this platform, users can record their phone calls and have them automatically transcribed by AI.

The name is inspired by the receptionist in the Raven Hotel in Altered Carbon. Which is also a reference to Edgar Allan Poe.

## How to run the project

Project is fully dockerized, thus, if you have Docker and are able to run docker compose, following command will start the whole project:

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

- I am not sure if the tasks in the queue is persistant (I believe it requires the Redis setup to be configured with a flag). Thus, this is another issue my project has. My implementation depends on MQ's retry mechanism, however, it feels like it should live in DB or somewhere else. If Redis that the BullMQ depend on can be persistent, it is not a problem.

- Depending on the previous statement, even if Redis is persistent, I am not sure what happens if a worker dies in the middle of the job. As BullMQ will not hear from it, the job will be locked (BullMQ locks the job if it is being processed by a worker) and will wait for the delay. 

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

  ```json
POST /auth/register
    // Request:
    {
        "email": "john.doe@example.org",
        "full_name": "John Doe",
        "password": "p4ssw0rd"
    }
    // Response:
    {
        "id": "d75d0e54-9292-42cc-800b-c2578f8a5bb4",
        "email": "john.doe@example.org",
        "full_name": "John Doe",
        "created_at": 
    }
  ```
  ```json
  POST /auth/login
    // Request:
    {
        "email": "john.doe@example.org",
        "password": "p4ssw0rd"
    }
    // Response:
    {
        "token": ""
        "user": {
            "id": "d75d0e54-9292-42cc-800b-c2578f8a5bb4",
            "email": "john.doe@example.org",
            "full_name": "John Doe",
            "created_at": 
        }
    }
  ```

  ```json
GET /auth/me
/* Requires the token given by the login endpoint to 
be stored in Authorization header of the request. */
    // Response:
    {
        "user": {
            "userId": "83d717c6-e774-4be1-8883-e2709d6c62c2",
            "email": "thomas.anderson@matrix.com",
            "iat": 1760904343,
            "exp": 1760990743
        }
    }
  ```
- POST /calls -> Create a new call
- GET /calls -> List calls
- GET /calls/:id -> Get details
- DELETE /calls/:id -> Delete
- GET /calls/:id/transcription -> Get transcription status/result
