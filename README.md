# NeighborhoodAssociationConnect

This is the development repository for **NeighborhoodAssociationConnect**.

## Prerequisites

- Docker & Docker Compose
- Node.js (v18 or later recommended)
- Expo CLI (installed globally or via `npx expo`)
- Tunnel service (e.g. Cloudflare Tunnel or ngrok) to open port `8080`

## Required .env files

### 1. Backend (`dev/backend/.env`)

Create a `.env` file at:

```
dev/backend/.env
```

#### Required Environment Variables (Backend)

```env
ENDPOINT_URL=
AZURE_OPENAI_API_KEY=
DEPLOYMENT_NAME=
API_VERSION=

FIREBASE_TYPE=
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
FIREBASE_AUTH_URI=
FIREBASE_TOKEN_URI=
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=
FIREBASE_CLIENT_X509_CERT_URL=
FIREBASE_UNIVERSE_DOMAIN=

QDRANT_API_KEY=

EMBEDDING_MODEL_NAME=
EMBEDDING_API_KEY=
EMBEDDING_ENDPOINT_URL=
EMBEDDING_API_VERSION=

TAVILY_API=

AZURE_COMPUTER_VISION_ENDPOINT=
AZURE_COMPUTER_VISION_KEY=

BACKEND_API_KEY=
```

---

### 2. Frontend Expo app (`dev/frontend/my-test-app/.env`)

Create a `.env` file at:

```
dev/frontend/my-test-app/.env
```

#### Required Environment Variables (Frontend Expo app)

```env
FIREBASE_API=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=

BACKEND_API_KEY=
DEPLOY_URL=
```

---

### 3. Frontend React app (`dev/frontend/react_app/.env`)

Create a `.env` file at:

```
dev/frontend/react_app/.env
```

#### Required Environment Variables (Frontend React app)

```env
VITE_BACKEND_API_KEY=
VITE_DEPLOY_URL=
```

---

## Setup

1. **Clone this repository**

```bash
git clone https://github.com/yourusername/NeighborhoodAssociationConnect.git
cd NeighborhoodAssociationConnect/dev
```

2. **Place your `.env` files**

- `dev/backend/.env`
- `dev/frontend/my-test-app/.env`
- `dev/frontend/react_app/.env`

3. **Start backend services via Docker Compose**

```bash
docker compose up
```

4. **Start the Expo frontend app**

In a separate terminal:

```bash
cd NeighborhoodAssociationConnect/dev/frontend/my-test-app
npx expo start
```

5. **Start the React frontend app**

In another terminal:

```bash
cd NeighborhoodAssociationConnect/dev/frontend/react_app
npm install
npm start
```

## Tunnel Setup

To make your backend accessible from the frontend and external integrations, open port `8080` using a tunnel service such as:

- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [ngrok](https://ngrok.com/)

Example with ngrok:

```bash
ngrok http 8080
```

## Notes

- Ensure all services are up and running before starting development.
- If you encounter CORS issues, check your tunnel configuration and API gateway settings.

## License

This software is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** license.

You are free to:

- Share — copy and redistribute the material in any medium or format
- Adapt — remix, transform, and build upon the material

Under the following terms:

- **Attribution** — You must give appropriate credit.
- **NonCommercial** — You may not use the material for commercial purposes.

See the full license text at [https://creativecommons.org/licenses/by-nc/4.0/](https://creativecommons.org/licenses/by-nc/4.0/).

© 2025 BPS-sys. All rights reserved.

