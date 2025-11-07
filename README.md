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

#TODO Update this to instatunnel
LocalTunnel public URL:

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



## Verify services



## Test sending / webhook flow (dev)

1. Make sure destination number is verified on Twilio if on a trial account.
2. Use API endpoint or UI in the frontend to send a message. Example curl (admin endpoint):

```bash
curl -X POST http://localhost:8080/api/messages/send \
  -H "Content-Type: application/json" \
  -d '{"to":"+1RECIPIENT_NUMBER","text":"test message"}'
```

Why: This triggers creation -> Twilio send -> statusCallback (delivered/failed) back to `PUBLIC_BASE_URL`.

## Logs and debugging

- Tail API logs:

```bash
docker compose logs -f api
```

- Tail all logs:

```bash
docker compose logs -f
```

Why: see Twilio responses, DB errors, socket events.

## Stop

```bash
docker compose down
```

Why: stops and removes containers (keeps volumes). Add `-v` to remove volumes.

## Security notes (dev)

- LocalTunnel exposes your API publicly. Validate Twilio webhooks (`X-Twilio-Signature`). Remove tunnel when done.
- Do not commit `.env`.

## Quick troubleshooting

- No public URL: confirm `localtunnel` service ran and used the intended subdomain; inspect logs.
- Twilio errors sending: check `TWILIO_*` env values and Twilio Console logs.
- Socket disconnects between frontend and backend: ensure frontend connects to `http://localhost:8080` (or to `PUBLIC_BASE_URL` in remote tests) and use Socket.IO client.

---

If you want, I’ll produce:

- a minimal `server.ts` snippet that fails fast if `PUBLIC_BASE_URL` is missing, or
- a one-liner to generate a safe `.env.example` file for repo. Which now?
