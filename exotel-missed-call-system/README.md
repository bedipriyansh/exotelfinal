# Enterprise Exotel Missed Call Management System

A production-ready Full-Stack Missed Call Management System integrated with the **Exotel platform**. This application tracks missed call events triggered by Exotel webhooks in real-time, displays call statistics on a premium reactive dashboard, and offers automated synchronization of historical logs via Exotel's REST API.

---

## System Architecture

```
[Customer Dialing]
       │
       ▼
 [Exotel Platform] ──(Detects Missed Call Event)
       │
       ├─► [Webhook POST /api/exotel/webhook] (Form Urlencoded / JSON)
       │         │
       │         ▼
       │   [Spring Boot Backend] ◄──► [MySQL Database]
       │         ▲
       │         │ (Axios API Requests)
       │         ▼
       │   [React Vite Dashboard UI]
       │
       └─► [Exotel REST API] ◄──(Manual / Scheduled Logs Sync)── [Backend Service]
```

---

## Technology Stack

### Backend
* **Java 21**
* **Spring Boot 3.4.1**
* **Spring Data JPA** & **Hibernate**
* **Spring Boot Actuator**
* **MySQL Connector/J**
* **Springdoc OpenAPI (Swagger UI)**
* **Lombok** & **SLF4J Logging**

### Frontend
* **React 18**
* **Vite 5**
* **Tailwind CSS** (v3)
* **Axios**
* **React Router DOM**
* **Lucide React**

---

## Directory Structure

```
exotel-missed-call-system/
├── backend/
│   ├── src/main/java/com/exotel/       # Spring Boot source files
│   ├── src/test/java/com/exotel/      # Backend test suites (JUnit/Mockito)
│   ├── src/main/resources/            # application.properties & SQL schemas
│   ├── Dockerfile
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/                # Custom charts, cards, spinner, toast
│   │   ├── context/                   # Theme context, Toast context
│   │   ├── layouts/                   # Responsive Dashboard Layout
│   │   ├── pages/                     # Dashboard, Logs, Settings, 404
│   │   └── services/                  # Axios service layer
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── Dockerfile
│   └── package.json
├── db/
│   └── init.sql                       # Database schema init script
├── docker-compose.yml
├── .gitignore
├── .env.example
├── Exotel_Missed_Call_System.postman_collection.json
└── README.md
```

---

## Installation & Setup

### Prerequisites
* Java JDK 21 installed.
* Node.js v18 or later.
* MySQL Server (v8.0 recommended).
* *Alternatively:* Docker and Docker Compose installed.

### 1. Database Configuration
Create a database named `exotel_db` in your MySQL server. You can initialize the table schema by running the script at [db/init.sql](file:///c:/Users/bedip/OneDrive/Desktop/exotel%20new/exotel-missed-call-system/db/init.sql).

### 2. Properties Configuration
Update the [backend/src/main/resources/application.properties](file:///c:/Users/bedip/OneDrive/Desktop/exotel%20new/exotel-missed-call-system/backend/src/main/resources/application.properties) with your MySQL database credentials and Exotel developer keys:

```properties
# MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/exotel_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=password

# Exotel Credentials
exotel.account.sid=your_account_sid
exotel.api.key=your_api_key
exotel.api.token=your_api_token
exotel.api.base-url=https://api.exotel.com
```

---

## Running the Application Locally

### Running the Backend
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Build and run the Spring Boot application using Maven:
   ```bash
   mvn clean spring-boot:run
   ```
3. The server starts at `http://localhost:8080`.
4. Access the REST Swagger API docs at `http://localhost:8080/swagger-ui.html`.

### Running the Frontend
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## Running with Docker Compose

To spin up all services (Backend, Frontend, and MySQL) in containers:
1. Populate your credentials in `.env` (refer to `.env.example`).
2. Run from the root directory:
   ```bash
   docker-compose up --build -d
   ```
3. Port mappings:
   * **React Dashboard:** `http://localhost:3000`
   * **Spring Boot API:** `http://localhost:8080`
   * **MySQL DB:** `localhost:3306`

---

## Webhook Endpoint Integration

Exotel's Passthru Applet sends missed call events as POST requests. The application supports both Form-Urlencoded and JSON payloads.

* **Webhook Endpoint URL:** `POST http://<your_server_domain>/api/exotel/webhook`

### Testing Webhooks via Curl
Run the following curl command to simulate an incoming form-urlencoded missed call webhook event:

```bash
curl -X POST http://localhost:8080/api/exotel/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "CallSid=exotel-webhook-sid-1002&From=%2B919876543210&To=%2B918047101122&Status=missed&Direction=incoming&Duration=0&StartTime=2026-06-28%2014%3A30%3A00"
```

*Tip: You can also use the **Webhook Event Simulator** built into the application's Configuration settings page to post mock webhook events directly from the UI dashboard.*

---

## REST API Reference

| Endpoint | Method | Parameters | Description |
| :--- | :--- | :--- | :--- |
| `/api/exotel/webhook` | `POST` | Payload | Receives Exotel Passthru event (supports form/JSON) |
| `/api/calls` | `GET` | page, size, sortBy, sortDir | Get paginated lists of logged calls |
| `/api/calls/{id}` | `GET` | None | Get specific call details by database record ID |
| `/api/calls/{id}` | `PUT` | Payload | Update an existing call log |
| `/api/calls/{id}` | `DELETE` | None | Delete a call log |
| `/api/calls/search` | `GET` | `q` (keyword) | Search calls by SID, caller, or exotel number |
| `/api/calls/filter` | `GET` | status, direction, startTime, endTime | Filter call logs by criteria |
| `/api/calls/statistics` | `GET` | None | Fetch aggregated metrics for charts |
| `/api/exotel/sync` | `GET` | None | Sync latest 50 call logs from Exotel REST API |

---

## Troubleshooting

1. **CORS Errors:**
   * Ensure that the frontend origin (`http://localhost:5173` or `http://localhost:3000`) is whitelisted in [CorsConfig.java](file:///c:/Users/bedip/OneDrive/Desktop/exotel%20new/exotel-missed-call-system/backend/src/main/java/com/exotel/config/CorsConfig.java).
2. **Database Connectivity Issues:**
   * Confirm MySQL is running and details match your configurations. If using Docker Compose, ensure the container name `db` matches the Spring profile.
3. **Exotel Sync Failures:**
   * Verify your Exotel Credentials in properties/environment variables. Ensure you are using the correct `AccountSid`, `API Key`, and `API Token`. Check backend logs using `docker logs exotel-backend` or checking standard logs directory.
