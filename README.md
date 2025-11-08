# SMS Chat

## Demo the App

### Prerequisites

- Install Docker & Docker Compose (or Docker Desktop with `docker compose`)
- Setup`.env` file at root
- Twilio account + trial number 
- Run .startup.sh 

### Configure Environment Files

Create a `.env` in the repo root with the following fields (see `.evn.example`)

```env
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=+10000000000 # prefix with a +1

# These two are the same number, one is for the API and one for the UI 
# Vite requires the VITE_ prefix
TEST_PHONE=+10000000000 # prefix with a +1
VITE_TEST_PHONE=+10000000000 # prefix with a +1
```

---

### Start Everything

From repo root:

```bash
# Required on linux / mac
chmod +x startup.sh

./startup.sh
```

**This takes care of everything, it will finish by opening 3 websites.**

The first website is the chat app itself: http//localhost:3000

<img width="659" height="407" alt="image" src="https://github.com/user-attachments/assets/13a2b8d2-4f9b-4c12-83d5-2c5df83d6626" />

The next two websites are live status pages from localhost: http://localhost:8080 along with the public facing version https://sms-chat.instatunnel.my/api/health-ui both of which auto-refresh every 5 seconds

<img width="520" height="475" alt="image" src="https://github.com/user-attachments/assets/9e16cc8b-886c-4f30-b258-bf7e72e38723" />

### Health & Status Checks

**API health as json**

```bash
curl http://localhost:8080/health
```

**Mongo (optional):**

Enter mongo shell
```bash
docker compose exec mongo mongosh
```

### Test Sending / Webhook Flow (Dev)

In the web app http://localhost:3000 you can simply start typing a message and it will attempt to go through twilio. If successful it will go into the database. You will need a verified phone number for this that is associated with your account credentials (which should be added to the `.env`

You can also simulate recieving a webohook but this will require disabling the `api/src/middleware/twilioWebhookAuth.ts` code.

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
- API not connecting to mongo, check mongo is actually a replica set. Enter mongo shell (see above) and then type `rs.conf()` and check if it shows you replica stats (therefore it is a replica) as well as checking the hostname is mongo:27017 rather than localhost:27017 

---

## Logs and Debugging

Watch logs:

```bash
# API Logs
docker compose logs -f api --tail=50

# All Logs
docker compose logs -f
```


## Security Notes (dev)

- **instatunnel** exposes your API publicly. Validate Twilio webhooks (`X-Twilio-Signature`). Remove tunnel when done.
- Do not commit `.env`.

---

## Local Development Commands

**Start Mongo locally:**

```bash
docker compose -f docker-compose.mongo.yml up -d
```

**Stop Mongo locally:**
docker compose -f docker-compose.mongo.yml down -v


**Start instatunnel locally:**

```bash
instatunnel connect 8080 -s SUBDOMAIN_HERE
```

**Setup `.env` for both /api and /web**
For Development:

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
API_URL=http://localhost:8080
TEST_PHONE=+1xxxXXXxxxx
(e.g. 999-888-7777 as +19998887777)
text
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
- Fixed api docker image
- Fixed docker compose issue running a replica set (for transactions)
- Created script for docker compose followed by instatunnel (it wont work in docker, architecture issue)
- Fixed Twilio auth check (two specific work arounds)
