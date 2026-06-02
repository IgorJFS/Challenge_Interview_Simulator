# Interview Challenge Simulator

A technical interview tool that goes beyond LeetCode. Instead of abstract puzzles, candidates face a real bug in a real codebase — and are evaluated not only on their ability to fix it, but on how they communicate under pressure.

---

## Demo

<!-- Add a GIF of the project running here -->

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

## Running locally

### Prerequisites

- .NET 10 SDK
- Node.js 18+
- SQL Server (local instance)
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### Backend

```bash
cd Backend/sim_backend
```

Create `appsettings.Development.json` with the following content:

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

Then run:

```bash
dotnet ef database update
dotnet run
```

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

Access the interviewer panel at `http://localhost:5173` and log in with the password you set above.

---

## Notes

- `appsettings.Development.json` is gitignored and must be created manually
- The Gemini free tier allows 15 requests per minute — sufficient for normal use
- All session data is deleted when the interviewer clicks "End Session"