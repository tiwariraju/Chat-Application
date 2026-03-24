# Real-Time Chat Application

Full-stack chat application built with Spring Boot, MySQL, JWT authentication, and WebSocket STOMP.

## 1) What I am using

### Backend
- Java 17
- Spring Boot 3 (Maven project)
- Spring Web (REST APIs)
- Spring Security + JWT filter
- Spring Data JPA (database access)
- Spring WebSocket + STOMP (real-time chat)
- MySQL (user data storage)
- Bean Validation (`@Valid`, request validations)

### Frontend
- HTML, CSS, JavaScript
- Bootstrap 5
- SockJS + STOMP client (WebSocket connection)
- `localStorage` (store JWT token and username)

## 2) How this project works

### Authentication flow
1. User signs up from `signup.html` (`POST /api/auth/signup`).
2. Password is hashed with BCrypt and user is saved in MySQL.
3. Backend returns JWT token.
4. Frontend stores token in `localStorage`.
5. User logs in from `index.html` (`POST /api/auth/login`) and gets JWT.

### Authorization flow
- For protected REST APIs, frontend sends:
  - `Authorization: Bearer <token>`
- `JwtAuthenticationFilter` validates token on each request.
- If token is missing/invalid, request is rejected.

### Real-time chat flow
1. Frontend opens SockJS connection to `/ws`.
2. STOMP `CONNECT` frame sends JWT in headers.
3. `AuthChannelInterceptor` validates JWT for WebSocket connection.
4. User sends message to `/app/chat.send`.
5. Backend broadcasts messages to `/topic/public`.
6. Active users list is pushed on `/topic/users`.
7. Join/leave events are shown as notifications in chat UI.

## 3) Main features

- Login and Signup pages
- Secure JWT-based authentication
- Real-time global chat room
- Active users sidebar
- Sender/receiver message bubbles
- Message timestamp
- Join/Leave notifications
- Redirect to login when token is missing/invalid

## 4) Project structure

```text
chat_Application/
|- src/main/java/com/chatapp/
|  |- config/        # SecurityConfig, WebSocketConfig
|  |- controller/    # AuthController, ChatController, GlobalExceptionHandler
|  |- dto/           # Request/Response message objects
|  |- model/         # User entity, MessageType enum
|  |- repository/    # UserRepository
|  |- security/      # JWT service/filter, UserDetailsService
|  |- service/       # Business logic
|  |- websocket/     # STOMP auth and connect/disconnect listeners
|- src/main/resources/
|  |- static/
|  |  |- index.html
|  |  |- signup.html
|  |  |- chat.html
|  |  |- css/style.css
|  |  |- js/auth.js
|  |  |- js/chat.js
|  |- application.properties
|- database/schema.sql
|- pom.xml
```

## 5) API endpoints

### Auth APIs
- `POST /api/auth/signup`
- `POST /api/auth/login`

### Chat APIs
- `GET /api/chat/active-users` (JWT required)
- `GET /api/chat/health`

## 6) WebSocket/STOMP endpoints

- WebSocket endpoint: `/ws`
- Application prefix: `/app`
- Broker prefix: `/topic`
- Publish message to: `/app/chat.send`
- Subscribe:
  - `/topic/public` (messages + join/leave events)
  - `/topic/users` (active users)

## 7) Database schema (MySQL)

Use file: `database/schema.sql`

Main table:
- `users`
  - `id` (PK)
  - `username` (unique)
  - `email` (unique)
  - `password` (hashed)
  - `created_at`

## 8) Setup and run (step by step)

1. Install:
   - Java 17+
   - Maven 3.9+
   - MySQL 8+

2. Create database:
   - Open MySQL and run SQL from `database/schema.sql`

3. Update DB credentials:
   - Edit `src/main/resources/application.properties`
   - Set:
     - `spring.datasource.username`
     - `spring.datasource.password`

4. Run application:
   - In project root:
     ```bash
     mvn spring-boot:run
     ```
   - If Maven permission issue occurs, use:
     ```bash
     mvn "-Dmaven.repo.local=./.m2repo" spring-boot:run
     ```

5. Open browser:
   - `http://localhost:8080`

6. Test:
   - Create account -> login -> open chat room
   - Open in second browser/user and verify real-time messages

## 9) Production notes

- Move JWT secret to environment variable
- Restrict CORS to trusted frontend domain
- Use HTTPS in production
- Add refresh-token flow
- Use external message broker for scaling (RabbitMQ/Redis)
