# SMS Chat

## Demo the App

### Prereqs

- Docker & Docker Compose (or Docker Desktop with `docker compose`).
- `.env` file in `/api` project's root (see sample below).
- (Optional) Twilio account + trial number if you want real SMS.

### Env

Create `.env` using `.env.example` for inspiration

Note:

- `PUBLIC_BASE_URL` is used for Twilio callbacks.
- `LOCALTUNNEL_SUBDOMAIN` picks the public URL. #TODO Update this to instatunnel

Run the following command (below) which will create a `.env` in `api/` copying all the fields from `api/.env.example` and only modifying the **required** twilio fields. Everything else can stay as is for demo purposes.

### Start everything

From repo root:

```bash
docker compose up --build
```

This builds the images, starts Mongo, the API, the frontend, and localtunnel (exposes the API to the internet so Twilio can hit the API's webhooks)

#TODO Update to correct
instatunnel public URL:

- If you set `PUBLIC_BASE_URL` in `.env` you already know it.
- Or inspect logs:

```bash
docker compose logs localtunnel --tail=50
```

API health:

```bash
curl http://localhost:8080/health
```

or visit http://localhost:8080/api/health-ui for an auto-refresh stats page

Mongo (optional check):

```bash
docker compose exec mongo mongo --eval 'db.getMongo()'
```

#TODO Update this to instatunnel
- Or read the file produced by the wait script inside the api container:

```bash
docker compose exec api cat /app/.localtunnel || true
```

### Test sending / webhook flow (dev)

1. Make sure destination number is verified on Twilio if on a trial account.
2. Use API endpoint or UI in the frontend to send a message. Example curl (admin endpoint):

```bash
curl -X POST http://localhost:8080/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{"to":"+1RECIPIENT_NUMBER","text":"test message"}'
```


## Development Commands

### Start Monogo locally

`docker run --name mongodb-dev -p 27017:27017 -d mongo`

### Start instatunnel locally

instatunnel 8080 -s sms-chat-123


## Test sending / webhook flow (dev)

1. Make sure destination number is verified on Twilio if on a trial account.
2. Use API endpoint or UI in the frontend to send a message. Example curl (admin endpoint):

```bash
curl -X POST http://localhost:8080/api/test/messages \
  -H "Content-Type: application/json" \
  -d '{"to":"+1RECIPIENT_NUMBER","text":"test message"}'
```

Why: This triggers creation -> Twilio send -> statusCallback (delivered/failed) back to `PUBLIC_BASE_URL`.

## Logs and debugging

- Watch logs

```bash
# API Logs
docker compose logs -f api

# All Logs
docker compose logs -f
```

See Twilio responses, DB errors, socket events.

## Stop

```bash
docker compose down
```

Stops and removes containers (keeps volumes). Add `-v` to remove volumes.

## Security notes (dev)

- **instatunnel** exposes your API publicly. Validate Twilio webhooks (`X-Twilio-Signature`). Remove tunnel when done.
- Do not commit `.env`.

## Quick troubleshooting

- No public URL: confirm `localtunnel` service ran and used the intended subdomain; inspect logs.
- Twilio errors sending: check `TWILIO_*` env values and Twilio Console logs.
- Socket disconnects between frontend and backend: ensure frontend connects to `http://localhost:8080` (or to `PUBLIC_BASE_URL` in remote tests) and use Socket.IO client.

## Development Log (not exact order due to overlap)
- Setup api with express
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