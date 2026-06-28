# RapidCart Frontend

A developer test UI for the RapidCart microservices backend. Replaces manual Postman testing with a visual interface.

## What it does

- **Dashboard** — Live health checks for all 4 services (Order, Inventory, Payment, Notification)
- **Orders** — Create orders, fetch by ID, view all orders with live status tracking
- **Inventory** — Add stock for any product
- **Saga Visualizer** — See the Kafka event chain animate in real time as your order flows through services
- **Request/Response Log** — Every API call is logged with method, URL, payload, status code, and response

## Prerequisites

Have the backend running via Docker Compose:

```bash
cd ..   # rapid-cart root
docker compose up --build
```

Services will be available at:
| Service | Port |
|---|---|
| Order Service | 8081 |
| Inventory Service | 8082 |
| Payment Service | 8083 |
| Notification Service | 8084 |

## Running the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

The Vite dev server proxies all `/orders`, `/inventory`, `/payment`, `/notification` requests to the respective backend ports — no CORS issues.

## Building for production

```bash
npm run build
npm run preview   # serve the dist/ folder locally
```

## Project structure

```
frontend/
├── public/             # Static assets
├── src/
│   ├── api/            # Typed fetch wrappers for each service
│   ├── components/     # Reusable UI pieces (Badge, Card, StatusChip …)
│   ├── pages/          # Dashboard, Orders, Inventory pages
│   ├── App.jsx         # Root with routing & layout
│   ├── main.jsx        # React entry point
│   └── index.css       # Global tokens & reset
├── .gitignore
├── package.json
├── README.md
└── vite.config.js
```
