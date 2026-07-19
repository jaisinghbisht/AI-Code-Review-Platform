# AI Code Review & Analysis Platform

An enterprise-grade, offline code review and static analysis application designed to parse Java workspaces, calculate codebase statistics, and generate structured architectural, security, and performance reviews using a local Large Language Model (LLM).

This project features an asynchronous background processing pipeline with live Server-Sent Events (SSE) progress tracking, a package-grouped code explorer, and interactive charting dashboards.

---

## Key Features

1. **ZIP Project Upload & Extraction**: Drag & drop Java project zip files. Files are extracted, and slip-protected directory structures are mapped out.
2. **Static Code Analysis**: Reuses a JavaParser engine to extract type definitions (classes, interfaces, enums, records), method signatures, field counts, and lines of code.
3. **Local AI Code Review**: Streams generated prompts representing codebase metadata, metrics, and select files to a local Ollama instance running the `qwen2.5-coder:7b` model.
4. **Asynchronous Processing Job Pipeline**: Uploads return immediately with a job ID, handing off work to a background executor that reports live stage updates (`QUEUED`, `EXTRACTING`, `SCANNING`, `ANALYZING`, `GENERATING_REVIEW`, `SAVING`, `COMPLETED`, `FAILED`).
5. **Real-time Server-Sent Events (SSE)**: Pushes stage details, percentage completion, and estimated remaining time to the client via an active text/event-stream emitter connection.
6. **IntelliJ-style Code Explorer**: Groups files by package name in a collapsible tree explorer, showing type metadata, fields, complete method tables, and syntax-highlighted code.
7. **Chart Dashboards**: Displays Doughnut and Bar charts showing class/interface distribution, package file density, and largest codebase components.

---

## Tech Stack

### Backend
* **Java 21** & **Spring Boot 3.2.5**
* **Spring AI** (for Ollama integration)
* **JavaParser** (for structural AST parsing)
* **PostgreSQL** (with **Flyway** schema migrations)
* **Docker & Docker Compose**

### Frontend
* **Angular 17 / 20** (with standalone components and signals)
* **TypeScript**
* **Angular Material** (for responsive UI components, expansion panels, and tables)
* **Chart.js** (for metrics visualization)
* **Highlight.js** (for syntax highlighting)
* **ngx-markdown** (for rendering AI reviews)

---

## Prerequisites

Ensure you have the following installed on your machine:
* **Java Development Kit (JDK) 21**
* **Node.js** (LTS version)
* **Docker** & **Docker Compose**
* **Ollama**

---

## Getting Started

### 1. Setup & Start Local AI (Ollama)
First, make sure Ollama is installed on your host system and pull the coder model:
```bash
# Pull the required coding model (approx. 4.7 GB)
ollama pull qwen2.5-coder:7b
```
Ensure Ollama is running in the background. It listens on port `11434` by default.

### 2. Run the Backend & Database (via Docker Compose)
Compile the Spring Boot application and launch the containers:
```bash
# Navigate to the backend directory
cd backend

# Compile and package the Spring Boot jar (skipping unit tests)
mvn clean install -DskipTests

# Return to the root and spin up the database and backend services
cd ..
docker compose up --build -d
```
* The PostgreSQL database starts on port `5432`.
* The Spring Boot API server starts on port `8080` (interacting with the database and connecting to the host machine's Ollama instance via `host.docker.internal`).

### 3. Run the Frontend (Angular Dev Server)
Navigate to the frontend folder, install dependencies, and launch the dev server:
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (respecting Angular 17 versions)
npm install

# Start the development server
npm start
```
* The Angular dev server launches at **[http://localhost:4200](http://localhost:4200)**.
* API requests are automatically proxied to the backend at port `8080` via `proxy.conf.json`.

---

## Usage Guide
1. Open your browser and go to `http://localhost:4200`.
2. Navigate to **Upload** and drop a ZIP archive of a Java project.
3. Observe the live processing stepper as it uploads the archive, parses class structures, and prompts the local LLM.
4. Explore the **Overview**, **AI Review**, **Code Explorer**, and **Metrics** tabs for deep insight into the uploaded codebase!
