# SMS Chat

## Demo the App

### Prerequisites

- Docker & Docker Compose (or Docker Desktop with `docker compose`)
- `.env` file in `/api` project's root (see sample below)
- (Optional) Twilio account + trial number if you want real SMS

### Configure Environment Files

**In `/api`**  
Create `.env` using `.env.example` as a template.

Required:

```env
Twilio - required if you want real SMS sending
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here

(e.g. 999-888-7777 as +19998887777)
TWILIO_PHONE_NUMBER=+1xxxXXXxxxx

Your receiving test phone (e.g. 999-888-7777 as +19998887777)
TEST_PHONE=+1##########
```

**In `/web`**  
Create `.env` using `.env.example` as a template.  
You need to enter an outgoing number in the form +1aaaBBBcccc (e.g. 000-555-1111 as +10005551111).

Required:

```env
VITE_API_URL=http://localhost:8080
VITE_TEST_PHONE_NUMBER=+1xxxXXXxxxx

(e.g. 999-888-7777 as +19998887777)
text
```

---

### Start Everything

From repo root:

```bash
docker compose up --build
```

- This builds the images, starts Mongo, the backend, the frontend, and instatunnel (exposes the API to the internet so Twilio can hit the API's webhooks).

If you set `PUBLIC_BASE_URL` in `.env`, you already know the public URL.

Or inspect logs:

```bash
docker compose logs instatunnel --tail=50
```

---

### Run the frontend

You should not be able to see the app running at http://localhost:3000

<img width="659" height="407" alt="image" src="https://github.com/user-attachments/assets/13a2b8d2-4f9b-4c12-83d5-2c5df83d6626" />


### Health & Status Checks

**API health:**

```bash
curl http://localhost:8080/health
```

Or visit:

[http://localhost:8080/api/health-ui](http://localhost:8080/api/health-ui)  
for an auto-refresh live stats page.

An example of the live health check page:

<img width="520" height="475" alt="image" src="https://github.com/user-attachments/assets/9e16cc8b-886c-4f30-b258-bf7e72e38723" />

**Mongo (optional):**

```bash
docker compose exec mongo mongo --eval 'db.getMongo()'
```

Or read the file produced by the wait script inside the api container:

```bash
docker compose exec api cat /app/.localtunnel || true
```

---

### Test Sending / Webhook Flow (Dev)

1. Make sure destination number is verified on Twilio if on a trial account.
2. Use API endpoint or UI in the frontend to send a message.

Example curl for webhook:

```bash
curl -X POST http://localhost:8080/api/messages/incoming
-H "Content-Type: application/json"
-d '{"from":"+15555555555","body":"test message","messageSid":"12345567890"}'
```

---

## Quick Troubleshooting

- No public URL: confirm `instatunnel` service ran and used the intended subdomain; inspect logs.
- Twilio errors sending: check `TWILIO_*` env values and Twilio Console logs.
- Socket disconnects backend/frontend: ensure frontend connects to `http://localhost:8080` (or to `PUBLIC_BASE_URL` in remote tests) and use Socket.IO client.

---

## Logs and Debugging

Watch logs:

```bash
# API Logs
docker compose logs -f api

# All Logs
docker compose logs -f
```

- See Twilio responses, DB errors, socket events.

---

## Stop

```bash
docker compose down
```

- Stops and removes containers (keeps volumes). Add `-v` to remove volumes.

---

## Security Notes (dev)

- **instatunnel** exposes your API publicly. Validate Twilio webhooks (`X-Twilio-Signature`). Remove tunnel when done.
- Do not commit `.env`.

---

## Local Development Commands

**Start Mongo locally:**

```bash
docker run --name mongodb-dev -p 27017:27017 -d mongo
```

**Start instatunnel locally:**

```bash
instatunnel connect 8080 -s SUBDOMAIN_HERE
```

---

## Development Log (not exact order)

 Setup api with express
  - Added basic architecture and test routes
- Setup web with boilerplate vuetify via vite
  - Ran into an issue where vite setup was spawning infinite terminals and bringing workstation to a halt, many others with similar issues on node 22 apparently (for [example](https://github.com/vitejs/vite/discussions/17735))
    - Apparently conflict with node 22 and associated npm version when running vite setup
    - Reinstlled NVM (for good measure) and bumped node to 24 and it resolved 
  - Added basic chat interface layout
- Added websockets to API and UI using [ws](https://www.npmjs.com/package/ws)
  - Added long polling architecture
- Switched from [ws](https://www.npmjs.com/package/ws) to [socket.io](https://socket.io/) to simplify code and get automatic long polling
- Added Twilio webhook and auth check (since we're publically exposing this endpoint)
  - Setup Twilio trial and tested my account. Unclear if I need to pay for it to make it work with SMS.
- Added health check page http://localhost:8080/api/health-ui
  - Ran into a lot of silent node issues (this has to do with my vscode, need to clean up some plugins), this page gives me a one-stop look at everything 
- Trying multiple tunnels to expose us to the internet
  - Tried ngrok - they require an account now, unclear of total setup issues in 2025, need a consistent url for free if possible to make the docker compose just work out of the box
  - Tried localtunnel - ran into issues
  - Using instatunnel
- Local machine had issue with docker (been using podman instead) (e.g. memory leak, random crashes in both docker and wsl)
  - Fixed WSL issues with docker
- Generated docker-compose and Dockerfile(s)
  - Testing local ones 
- Cleaned up API and refactored
- Refactored Docker Compose & Dockerfiles
- Redesigned frontend with Vuetify
- Added websocket and long polling status bar to frontend
- End-to-end Socket.IO integration
- Twilio message receiving
- Visual and style bug fixes
- Mongo transactions fixed (single node replica set)
- Setup instatunnel
