# Interview Challenge Simulator

A technical interview tool that goes beyond LeetCode. Instead of abstract puzzles, candidates face a real bug in a real codebase — and are evaluated not only on their ability to fix it, but on how they communicate under pressure.

---

## Demo

![Interview Challenge Simulator Demo](interview_challenge_preview.mp4)

---

## How it works

The interviewer creates a session by selecting a job role. The backend calls the Gemini API to generate a small JavaScript snippet with an intentional bug appropriate for that role. The candidate receives a link and has 15 minutes to find the bug, fix it, and explain what went wrong.

If time runs out, a second stage unlocks: a cosmetic Slack-like workspace where the candidate can message the team, ask for help, and demonstrate that they know how to communicate a problem even when they can't solve it alone. The interviewer monitors everything in real time from their dashboard.

When the session ends, all data is permanently deleted.

---

## Tech stack

- **Frontend:** React, TypeScript, Tailwind CSS, Monaco Editor
- **Backend:** C# with ASP.NET Core Web API
- **Database:** SQL Server with Entity Framework Core
- **AI:** Google Gemini API

---

## Getting Started

You can run this project either using Docker (recommended for quick setup) or locally by running the backend and frontend services separately.

---

## Running with Docker (Recommended)

Docker Compose automatically spins up the database (SQL Server), the backend API, and the frontend web app with a single command.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### Setup & Run

1. **Configure Environment Variables:**
   Copy the `.env.example` file in the root directory to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and fill in your details:
   - `AUTH_PASSWORD`: The password you will use to log in to the interviewer dashboard.
   - `GEMINI_API_KEY`: Your Google Gemini API key (get one for free at [aistudio.google.com](https://aistudio.google.com)).

2. **Spin up the Containers:**
   In the root directory, run:
   ```bash
   docker compose up --build
   ```

3. **Access the Application:**
   - **Interviewer / Candidate Web Client:** [http://localhost:5173](http://localhost:5173)
   - **Backend API Docs / Base:** [http://localhost:5138/api](http://localhost:5138/api)

---

## Running locally

If you prefer to run the services individually on your machine:

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js](https://nodejs.org/) (v18+)
- SQL Server (local instance running)
- Google Gemini API key

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd Backend/sim_backend
   ```
2. Create an `appsettings.Development.json` file in `Backend/sim_backend/` with the following configuration:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=InterviewChallengeDB;Trusted_Connection=True;TrustServerCertificate=True;"
     },
     "Auth": {
       "Password": "your_password_here"
     },
     "Gemini": {
       "ApiKey": "your_gemini_api_key_here"
     }
   }
   ```
3. Apply Entity Framework migrations and start the backend:
   ```bash
   dotnet ef database update
   dotnet run
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the interviewer panel at [http://localhost:5173](http://localhost:5173) and log in using the password configured in `appsettings.Development.json`.

---

## Notes

- `appsettings.Development.json` and `.env` are gitignored to prevent sensitive credentials leaking.
- All session data is permanently deleted from the database when the interviewer clicks "End Session" in their dashboard.